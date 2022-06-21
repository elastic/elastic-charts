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
import { Octokit } from '@octokit/rest';
import { getMetadata, metadataExists, setMetadata } from 'buildkite-agent-node';
import ghpages from 'gh-pages';
import minimatch, { IOptions as MinimatchOptions } from 'minimatch';
import { Optional } from 'utility-types';

import { getJobCheckName } from './build';
import { bkEnv } from './buildkite';
import { getNumber } from './common';
import { MetaDataKeys } from './constants';
import { CheckStatusOptions, CreateCheckOptions } from './octokit';
import { OctokitParameters, FileDiff } from './types';

if (!process.env.GITHUB_AUTH) throw new Error('GITHUB_AUTH env variable must be defined');

const auth = JSON.parse(process.env.GITHUB_AUTH);
const MyOctokit = Octokit.plugin(retry);
export const octokit = new MyOctokit({
  authStrategy: createAppAuth,
  auth: auth,
});

const defaultGHOptions = {
  owner: 'elastic',
  repo: 'elastic-charts',
};

class FilesContext {
  private _files: FileDiff[] = [];

  async init() {
    this._files = await getFileDiffs();
  }

  get all(): readonly FileDiff[] {
    return this._files;
  }

  get names(): readonly string[] {
    return this._files.map((f) => f.filename);
  }

  /**
   * Match files against regular expression
   */
  filter(regex: RegExp): FileDiff[];
  /**
   * Match files against multiple regular expressions
   */
  filter(regexs: RegExp[]): FileDiff[];
  /**
   * Match files against a minimatch pattern
   */
  filter(pattern: string, options?: MinimatchOptions): FileDiff[];
  filter(patterns: string[], options?: MinimatchOptions): FileDiff[];
  filter(patterns: (string | RegExp)[], options?: MinimatchOptions): FileDiff[];
  filter(patternsArg: RegExp | string | (string | RegExp)[], options?: MinimatchOptions): FileDiff[] {
    const patterns = Array.isArray(patternsArg) ? patternsArg : [patternsArg];

    if (patterns.length === 0) throw new Error('No pattern provided');

    return this.all.filter(({ filename: f }) => {
      return patterns.some((pattern) =>
        typeof pattern === 'string' ? minimatch(f, pattern, options) : pattern.exec(f),
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
        typeof pattern === 'string' ? minimatch(f, pattern, options) : pattern.exec(f),
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

  console.log(JSON.stringify(latestCheckRun, null, 2));

  return latestCheckRun?.status === 'completed';
};

let cacheFilled = false;
const checkRunCache = new Map<string, components['schemas']['check-run']>();
const fillCheckRunCache = async () =>
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

export const updateCheckStatus = async (
  options: Optional<Omit<CreateCheckOptions, 'name' | 'head_sha'>, 'repo' | 'owner'> & CheckStatusOptions,
  checkId: string | undefined = bkEnv.checkId,
  title?: string | boolean | null, // true for skip description
) => {
  if (process.env.BLOCK_REQUESTS || !checkId) return;
  console.log(bkEnv.jobUrl);
  // @ts-ignore test
  console.trace(checkId, options.status, options.conclusion);

  if (!cacheFilled) await fillCheckRunCache();
  const checkRun = checkRunCache.get(checkId);
  // In some cases a check run may have been skipped or otherwise completed and the only way to
  // revert the completed check run is to create a new check run. This will not show as a duplicate run.
  const newCheckNeeded = options.status !== 'completed' && checkRun?.status === 'completed';

  try {
    const output =
      title && typeof title === 'string'
        ? {
            title: title,
            summary: title,
            ...options.output,
          }
        : undefined;
    if (!checkRun || newCheckNeeded) {
      if (!bkEnv.commit) throw new Error(`Failed to set status, no head_sha provided`);
      const name = getJobCheckName(checkId);
      await octokit.checks.create({
        ...defaultGHOptions,
        details_url: bkEnv.jobUrl,
        ...options,
        output,
        name,
        head_sha: bkEnv.commit,
      } as any); // octokit types are bad :(
    } else {
      await octokit.checks.update({
        ...defaultGHOptions,
        details_url: bkEnv.jobUrl,
        ...options,
        output,
        check_run_id: checkRun.id, // required
      } as any); // octokit types are bad :(
    }
  } catch (error) {
    console.error(`Failed to create/update check run for ${checkId} [sha: ${bkEnv.commit}]`);
    console.error(error);
    throw error;
  }
};

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
      environment: 'buildkite', // TODO
      transient_environment: false, // sets previous statuses to inactive
      production_environment: false,
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
  options: Optional<Omit<OctokitParameters<'repos/create-deployment-status'>, 'deployment_id'>> = {},
) => {
  if (process.env.BLOCK_REQUESTS) return;
  if ((await getMetadata(MetaDataKeys.skipDeployment)) === 'true') return;

  const deployment_id = getNumber(await getMetadata(MetaDataKeys.deploymentId));

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

async function getFileDiffs(): Promise<FileDiff[]> {
  if (!bkEnv.isPullRequest) return [];
  const prNumber = bkEnv.pullRequestNumber;

  if (!prNumber) throw new Error(`Failed to set status, no prNumber available`);

  try {
    const { data } = await octokit.pulls.listFiles({
      ...defaultGHOptions,
      pull_number: prNumber,
    });
    return data;
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
        silent: true,
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
