/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAppAuth, StrategyOptions } from '@octokit/auth-app';
import { components } from '@octokit/openapi-types';
import { retry } from '@octokit/plugin-retry';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import { getMetadata, metadataExists, setMetadata } from 'buildkite-agent-node';
import ghpages from 'gh-pages';
import minimatch, { IOptions as MinimatchOptions } from 'minimatch';
import { Optional } from 'utility-types';

import { getJobCheckName } from './build';
import { bkEnv } from './buildkite';
import { getNumber } from './common';
import { MetaDataKeys } from './constants';
import { CheckStatusOptions, CreateCheckOptions } from './octokit';
import { OctokitParameters } from './types';

if (!process.env.GITHUB_AUTH) throw new Error('GITHUB_AUTH env variable must be defined');

const defaultMMOptions: MinimatchOptions = {
  dot: true,
};

const auth = JSON.parse(process.env.GITHUB_AUTH);
const MyOctokit = Octokit.plugin(retry);
export const octokit = new MyOctokit({
  authStrategy: createAppAuth,
  auth,
});

export const defaultGHOptions = {
  owner: 'elastic',
  repo: 'elastic-charts',
};

class FilesContext {
  private _files: string[] = [];

  async init() {
    this._files = await getFileDiffs();
  }

  get names(): readonly string[] {
    return this._files;
  }

  /**
   * Match files against regular expression
   */
  filter(regex: RegExp): string[];
  /**
   * Match files against multiple regular expressions
   */
  filter(regexs: RegExp[]): string[];
  /**
   * Match files against a minimatch pattern
   */
  filter(pattern: string, options?: MinimatchOptions): string[];
  filter(patterns: string[], options?: MinimatchOptions): string[];
  filter(patterns: (string | RegExp)[], options?: MinimatchOptions): string[];
  filter(patternsArg: RegExp | string | (string | RegExp)[], options?: MinimatchOptions): string[] {
    const patterns = Array.isArray(patternsArg) ? patternsArg : [patternsArg];

    if (patterns.length === 0) throw new Error('No pattern provided');

    return this.names.filter((f) => {
      return patterns.some((pattern) =>
        typeof pattern === 'string' ? minimatch(f, pattern, { ...defaultMMOptions, ...options }) : pattern.exec(f),
      );
    });
  }

  /**
   * Match files against regular expression
   */
  has(regex: RegExp): boolean;
  /**
   * Match files against multiple regular expressions
   */
  has(regexs: RegExp[]): boolean;
  /**
   * Match files against a minimatch pattern
   */
  has(pattern: string, options?: MinimatchOptions): boolean;
  has(patterns: string[], options?: MinimatchOptions): boolean;
  has(patterns: (string | RegExp)[], options?: MinimatchOptions): boolean;
  has(patternsArg: RegExp | string | (string | RegExp)[], options?: MinimatchOptions): boolean {
    const patterns = Array.isArray(patternsArg) ? patternsArg : [patternsArg];

    if (patterns.length === 0) throw new Error('No pattern provided');

    return this.names.some((f) => {
      return patterns.some((pattern) =>
        typeof pattern === 'string' ? minimatch(f, pattern, { ...defaultMMOptions, ...options }) : pattern.exec(f),
      );
    });
  }
}

export class ChangeContext {
  private filesCtx: FilesContext;
  private isInitialized = false;

  constructor() {
    this.filesCtx = new FilesContext();
  }

  private checkInit() {
    if (!this.isInitialized) {
      throw new Error('ChangeContext not yet initialized');
    }
  }

  async init() {
    this.isInitialized = true;
    await this.filesCtx.init();
  }

  get files(): FilesContext {
    this.checkInit();
    return this.filesCtx;
  }
}

export const codeCheckIsCompleted = async (id = bkEnv.checkId, userRef?: string): Promise<boolean> => {
  const ref = userRef ?? bkEnv.commit;
  if (!ref) throw new Error(`Failed to get status, no ref provided`);
  if (!id) throw new Error(`Failed to set status, no name provided`);
  const name = getJobCheckName(id);

  const {
    status,
    data: {
      check_runs: [latestCheckRun],
    },
  } = await octokit.checks.listForRef({
    ...defaultGHOptions,
    ref,
    check_name: name,
    app_id: auth.appId,
    per_page: 1,
  });
  if (status !== 200) throw new Error('Failed to find check completeness');

  return latestCheckRun?.status === 'completed';
};

let cacheFilled = false;
const checkRunCache = new Map<string, components['schemas']['check-run']>();
const fillCheckRunCache = async () =>
  // eslint-disable-next-line @typescript-eslint/return-await
  await octokit.checks
    .listForRef({
      ...defaultGHOptions,
      ref: bkEnv.commit ?? '',
      per_page: 100, // max
    })
    .then(({ data: { total_count: total, check_runs: checkRuns } }) => {
      if (total > checkRuns.length) throw new Error('Checks need pagination');

      cacheFilled = true;
      return checkRuns.forEach((checkRun) => {
        if (checkRun.external_id) {
          checkRunCache.set(checkRun.external_id, checkRun);
        }
      });
    });

function pickDefined<R extends Record<string, unknown>>(source: R): R {
  return Object.keys(source).reduce((acc, key) => {
    const val = source[key];
    if (val !== undefined && val !== null && val !== '') {
      // @ts-ignore - building new R from {}
      acc[key] = val;
    }
    return acc;
  }, {} as R);
}

export async function syncCheckRun({
  name,
  details_url,
  external_id,
  status,
  conclusion,
  started_at,
  completed_at,
  output: { title, summary },
}: components['schemas']['check-run']) {
  const syncCommit = await getMetadata('syncCommit');
  if (syncCommit) {
    const output = title && summary ? { title, summary } : undefined;
    // TODO find a better way to do this for commits by datavis bot
    // Syncs checks to newer skipped commit
    await octokit.checks.create(
      pickDefined({
        ...defaultGHOptions,
        name,
        details_url,
        external_id,
        output,
        status,
        conclusion,
        started_at,
        completed_at,
        head_sha: syncCommit,
      }),
    );
  }
}

export const updateCheckStatus = async (
  options: Optional<Omit<CreateCheckOptions, 'name' | 'head_sha'>, 'repo' | 'owner'> & CheckStatusOptions,
  checkId: string | undefined = bkEnv.checkId,
  title?: string | boolean | null, // true for skip description
) => {
  if (process.env.BLOCK_REQUESTS || !checkId) return;

  if (!cacheFilled) await fillCheckRunCache();
  const checkRun = checkRunCache.get(checkId);
  // In some cases a check run may have been skipped or otherwise completed and the only way to
  // revert the completed check run is to create a new check run. This will not show as a duplicate run.
  const newCheckNeeded = options.status !== 'completed' && checkRun?.status === 'completed';

  console.trace('updateCheckStatus', checkId, title);
  console.log(JSON.stringify(options, null, 2));

  try {
    const output =
      title && typeof title === 'string'
        ? {
            title,
            summary: title,
            ...options.output,
          }
        : undefined;
    const name = getJobCheckName(checkId);
    if (!checkRun || newCheckNeeded) {
      if (!bkEnv.commit) throw new Error(`Failed to set status, no head_sha provided`);
      const { data: check } = await octokit.checks.create({
        ...defaultGHOptions,
        details_url: bkEnv.jobUrl,
        ...options,
        output,
        name,
        external_id: checkId,
        head_sha: bkEnv.commit,
      } as any); // octokit types are bad :(
      await syncCheckRun(check);
    } else {
      const { data: check } = await octokit.checks.update({
        ...defaultGHOptions,
        details_url: bkEnv.jobUrl,
        ...options,
        ...(options.status === 'in_progress' &&
          checkRun.status !== 'in_progress' && {
            // Updates start time when job actually starts to run
            started_at: new Date().toISOString(),
          }),
        output,
        external_id: checkId,
        check_run_id: checkRun.id, // required
      } as any); // octokit types are bad :(
      await syncCheckRun(check);
    }
  } catch (error) {
    console.error(`Failed to create/update check run for ${checkId} [sha: ${bkEnv.commit}]`);
    console.error(error);
    throw error;
  }
};

export const getDeploymentTask = () =>
  bkEnv.isPullRequest ? `deploy:pr:${bkEnv.pullRequestNumber}` : `deploy:${bkEnv.branch}`;

export const createDeployment = async (
  options: Optional<OctokitParameters<'repos/create-deployment-status'>> = {},
): Promise<number | null> => {
  if (process.env.BLOCK_REQUESTS) return null;
  if (await metadataExists(MetaDataKeys.deploymentId)) {
    console.warn(`Deployment already exists for build`);
  }

  const ref = bkEnv.commit;

  if (!ref) throw new Error(`Failed to set status, no ref available`);

  try {
    const response = await octokit.repos.createDeployment({
      ...defaultGHOptions,
      environment: bkEnv.isPullRequest ? 'pull-requests' : bkEnv.branch,
      transient_environment: bkEnv.isPullRequest, // sets previous statuses to inactive
      production_environment: false,
      task: getDeploymentTask(),
      ...options,
      auto_merge: false, // use branch as is without merging with base
      required_contexts: [],
      ref,
    });
    if (response.status === 202) return null; // Merged branch response

    await setMetadata(MetaDataKeys.deploymentId, String(response.data.id));
    return response.data.id;
  } catch (error) {
    console.error(`Failed to create deployment for ref [${ref}]`);
    throw error;
  }
};

export const createDeploymentStatus = async (
  options: Optional<OctokitParameters<'repos/create-deployment-status'>> = {},
) => {
  if (process.env.BLOCK_REQUESTS) return;

  console.trace('createDeploymentStatus', options.state);

  console.log('MetaDataKeys.skipDeployment', await getMetadata(MetaDataKeys.skipDeployment));

  if ((await getMetadata(MetaDataKeys.skipDeployment)) === 'true') return;

  const deployment_id = options.deployment_id ?? getNumber(await getMetadata(MetaDataKeys.deploymentId));

  if (deployment_id === null) throw new Error(`Failed to set status, no deployment found`);

  try {
    await octokit.rest.repos.createDeploymentStatus({
      ...defaultGHOptions,
      state: 'success',
      log_url: bkEnv.jobUrl,
      ...options,
      deployment_id,
    });
  } catch {
    // Should not throw as this would be an issue with CI
    console.error(`Failed to create deployment status for deployment [${deployment_id}]`);
  }
};

interface GLQPullRequestFiles {
  repository: {
    pullRequest: {
      files: {
        totalCount: number;
        pageInfo: {
          endCursor: string;
          hasNextPage: boolean;
        };
        nodes: [
          {
            path: string;
          },
        ];
      };
    };
  };
}

export async function updatePreviousDeployments(
  state: RestEndpointMethodTypes['repos']['createDeploymentStatus']['parameters']['state'] = 'inactive',
) {
  const currentDeploymentId = getNumber(await getMetadata(MetaDataKeys.deploymentId));
  const { data: deployments } = await octokit.repos.listDeployments({
    ...defaultGHOptions,
    task: getDeploymentTask(),
    per_page: 100, // should never get this high
  });

  await Promise.all(
    deployments.map(async ({ id }) => {
      if (id === currentDeploymentId) return;
      const {
        data: [{ state: currentState, log_url, environment_url }],
      } = await octokit.repos.listDeploymentStatuses({
        ...defaultGHOptions,
        deployment_id: id,
        per_page: 1,
      });

      if (!['in_progress', 'queued', 'pending', 'success'].includes(currentState)) {
        return;
      }

      console.log(`Updating deployment ${id} state: ${currentState} -> ${state}`);

      await octokit.repos.createDeploymentStatus({
        ...defaultGHOptions,
        deployment_id: id,
        description: 'This deployment precedes a newer deployment',
        log_url,
        environment_url,
        state,
      });
    }),
  );
}

export async function getFileDiffs(): Promise<string[]> {
  if (!bkEnv.isPullRequest) return [];

  const prNumber = bkEnv.pullRequestNumber;
  if (!prNumber) throw new Error(`Failed to set status, no prNumber available`);

  try {
    const files: string[] = [];
    let hasNextPage = true;
    let after = '';

    while (hasNextPage) {
      const response = (
        await octokit.graphql<GLQPullRequestFiles>(`query getFileNames {
          repository(owner: "${defaultGHOptions.owner}", name: "${defaultGHOptions.repo}") {
            pullRequest(number: ${prNumber}) {
              files(first: 100${after}) {
                totalCount
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  path
                }
              }
            }
          }
        }`)
      ).repository.pullRequest.files;
      hasNextPage = response.pageInfo.hasNextPage;
      after = `, after: "${response.pageInfo.endCursor}"`;
      files.push(...response.nodes.map(({ path }) => path));
    }

    return files;
  } catch (error) {
    console.error(`Failed to list files for PR #${prNumber}`);
    throw error;
  }
}

export async function ghpDeploy(outDir: string) {
  if (!process.env.GITHUB_AUTH) throw new Error('GITHUB_AUTH env variable must be defined');

  const auth = createAppAuth(JSON.parse(process.env.GITHUB_AUTH) as StrategyOptions);
  const { token } = await auth({
    type: 'installation',
  });

  await new Promise<void>((resolve, reject) => {
    ghpages.publish(
      outDir,
      {
        user: {
          // TODO share this between github_bot package
          name: 'elastic-datavis[bot]',
          email: '98618603+elastic-datavis[bot]@users.noreply.github.com',
        },
        silent: false,
        branch: 'gh-pages',
        message: `Deploying ${bkEnv.commit ?? 'latest changes'} 🚀`,
        repo: `https://git:${token}@github.com/elastic/elastic-charts.git`,
      },
      (error) => {
        if (error) reject(error);
        else resolve();
      },
    );
  });
}

function generateMsg(key: string, body: string): string {
  return `<!-- comment-key: ${key} -->\n${body}`;
}

const reMsgKey = /^<!-- comment-key: (.+) -->/;
export function commentByKey<T extends keyof Comments>(key: T) {
  return (comment?: string): boolean => {
    if (!comment) return false;
    const [, commentKey] = reMsgKey.exec(comment) ?? [];
    return commentKey === key;
  };
}

export const comments = {
  communityPR() {
    return `Community pull request, @elastic/datavis please add the \`ci:approved ✅\` label to allow this and future builds.`;
  },
  deployments(deploymentUrl: string, sha: string) {
    return `## Deployments - ${sha}

- Storybook ([link](${deploymentUrl}))
- e2e server ([link](${deploymentUrl}/e2e))
- Playwright report ([link](${deploymentUrl}/e2e-report))`;
  },
};

type Comments = typeof comments;

export function getComment<T extends keyof Comments>(key: T, ...args: Parameters<Comments[T]>): string {
  // @ts-ignore - conditional args
  const comment = comments[key](...args);
  return generateMsg(key, comment);
}
