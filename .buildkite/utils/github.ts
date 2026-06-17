/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { StrategyOptions } from '@octokit/auth-app';
import { createAppAuth } from '@octokit/auth-app';
import type { components } from '@octokit/openapi-types';
import { retry } from '@octokit/plugin-retry';
import { Octokit } from '@octokit/rest';
import { getMetadata } from 'buildkite-agent-node';
import ghpages from 'gh-pages';
import type { MinimatchOptions } from 'minimatch';
import { minimatch } from 'minimatch';
import type { Optional } from 'utility-types';

import { getJobCheckName } from './build';
import { bkEnv } from './buildkite';
import type { TestCheckConclusion, TestCheckStatus, UpdateDeploymentCommentOptions } from './deployment';
import type { CheckStatusOptions, CreateCheckOptions } from './octokit';

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
  private _files: FileDiff[] = [];
  private _initialized: boolean = false;

  constructor(files?: FileDiff[]) {
    if (files) {
      this._files = files;
      this._initialized = true;
    }
  }

  async init() {
    if (!this._initialized) {
      this._files = await getFileDiffs();
      this._initialized = true;
    }
  }

  get names(): readonly string[] {
    return this._files.map(({ path }) => path);
  }

  /**
   * Returns new FileContext by given changeType(s)
   */
  byType(type: FileDiff['changeType'], negate?: boolean): FilesContext;
  byType(types: FileDiff['changeType'][], negate?: boolean): FilesContext;
  byType(typeArg: FileDiff['changeType'] | FileDiff['changeType'][], negate: boolean = false): FilesContext {
    const changeTypes = Array.isArray(typeArg) ? typeArg : [typeArg];

    if (changeTypes.length === 0) {
      console.warn('No changeType(s) provided');
    }

    const filesByType = this._files.filter(({ changeType }) => {
      const match = changeTypes.includes(changeType);
      return negate ? !match : match;
    });

    return new FilesContext(filesByType);
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
      });
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
      });
      await syncCheckRun(check);
    }
  } catch (error) {
    console.error(`Failed to create/update check run for ${checkId} [sha: ${bkEnv.commit}]`);
    console.error(error);
    throw error;
  }
};

/**
 * Resolves the latest GitHub check-run conclusion for the given test check ids.
 * Tests live as their own check runs (set in e2e_reports.ts), independent from the
 * preview deployment. Returns `pending` when a check has not yet completed.
 */
export const getTestCheckStatuses = async (
  checkIds: { id: string; label: string }[],
  userRef?: string,
): Promise<TestCheckStatus[]> => {
  const ref = userRef ?? bkEnv.commit;
  if (!ref) return checkIds.map(({ label }): TestCheckStatus => ({ label, conclusion: 'pending' }));

  // eslint-disable-next-line @typescript-eslint/return-await
  return Promise.all(
    checkIds.map(async ({ id, label }): Promise<TestCheckStatus> => {
      try {
        const name = getJobCheckName(id);
        const {
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

        if (latestCheckRun?.status !== 'completed') {
          return { label, conclusion: 'pending' };
        }

        const { conclusion } = latestCheckRun;
        if (conclusion === 'success') return { label, conclusion: 'success' };
        // Skipped/neutral checks (e.g. a linter skipped because no relevant files changed)
        // should not count as a failure nor block a successful run.
        if (conclusion === 'skipped' || conclusion === 'neutral') return { label, conclusion: 'skipped' };
        return { label, conclusion: 'failure' };
      } catch {
        return { label, conclusion: 'pending' };
      }
    }),
  );
};

interface FileDiff {
  path: string;
  changeType: 'ADDED' | 'DELETED' | 'RENAMED' | 'COPIED' | 'MODIFIED' | 'CHANGED';
}

interface GLQPullRequestFiles {
  repository: {
    pullRequest: {
      files: {
        totalCount: number;
        pageInfo: {
          endCursor: string;
          hasNextPage: boolean;
        };
        nodes: FileDiff[];
      };
    };
  };
}

export async function getFileDiffs(): Promise<FileDiff[]> {
  if (!bkEnv.isPullRequest) return [];

  const prNumber = bkEnv.pullRequestNumber;
  if (!prNumber) throw new Error(`Failed to set status, no prNumber available`);

  try {
    const files: FileDiff[] = [];
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
                  changeType
                }
              }
            }
          }
        }`)
      ).repository.pullRequest.files;
      hasNextPage = response.pageInfo.hasNextPage;
      after = `, after: "${response.pageInfo.endCursor}"`;
      files.push(...response.nodes);
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
  return (commentRaw?: string | { body?: string }): boolean => {
    const comment = typeof commentRaw === 'string' ? commentRaw : commentRaw?.body;
    if (!comment) return false;
    const [, commentKey] = reMsgKey.exec(comment) ?? [];
    return commentKey === key;
  };
}

export const comments = {
  communityPR() {
    return `Community pull request, @elastic/datavis please add the \`ci:approved ✅\` label to allow this and future builds.`;
  },
  deployment({
    deploymentUrl,
    packagesUrl,
    packageTarballUrl,
    commitPackageTarballUrl,
    commitPackageTarballLabel,
    sha,
    previousSha,
    state,
    errorCmd,
    errorMsg,
    jobLink,
    preDeploy = false,
    testStatuses = [],
  }: UpdateDeploymentCommentOptions) {
    console.warn(`DEPLOYMENT STATUS - ${state} - preDeploy: ${preDeploy}`);

    const buildUrl = bkEnv.buildUrl;
    const buildText = !buildUrl ? '' : ` ([build#${buildUrl.split('/').pop()}](${buildUrl}))`;
    const packageLinks = getPackageLinks(
      packagesUrl,
      packageTarballUrl,
      commitPackageTarballUrl,
      commitPackageTarballLabel,
    );

    // Deployment failed: the preview site could not be published. This is distinct from
    // the test results - the tests may not even have run yet.
    if (state === 'failure') {
      const errorCmdMsg = errorCmd
        ? `\n\n**Command failed:**
\`\`\`
${errorCmd}
\`\`\``
        : '';
      const err = errorMsg
        ? `${errorCmdMsg}

**Error:**

\`\`\`
${errorMsg}
\`\`\``
        : errorCmdMsg;

      const deploymentTable = renderStatusTable([
        { label: 'Docs', status: '❌ Failed' },
        { label: 'Storybook', status: '❌ Failed' },
        { label: 'e2e server', status: '❌ Failed' },
        ...(packageLinks ? [{ label: 'Packages', status: '❌ Failed' }] : []),
      ]);

      return `## ❌ Failed${buildText} - ${sha}

### 📦 Deployment ❌
The preview site failed to deploy${jobLink ? ` - [failed job](${jobLink})` : ''}.

${deploymentTable}
${err}

cc: @nickofthyme`.trim();
    }

    // Deployment is in progress: nothing is live yet.
    if (state === 'pending') {
      const updateComment = previousSha ? `\n> 🚧 Updating deployment from ${previousSha}` : '';
      const deploymentTable =
        previousSha && deploymentUrl
          ? renderStatusTable([
              { label: 'Docs', status: `[old deployment](${deploymentUrl})` },
              { label: 'Storybook', status: `[old deployment](${deploymentUrl}/storybook)` },
              { label: 'e2e server', status: `[old deployment](${deploymentUrl}/e2e)` },
              ...(packageLinks ? [{ label: 'Packages', status: packageLinks }] : []),
            ])
          : renderStatusTable([
              { label: 'Docs', status: '⏳ Deploying' },
              { label: 'Storybook', status: '⏳ Deploying' },
              { label: 'e2e server', status: '⏳ Deploying' },
              ...(packageLinks ? [{ label: 'Packages', status: '⏳ Pending' }] : []),
            ]);

      return `## ⏳ In Progress${buildText} - ${sha}${updateComment}

### 📦 Deployment ⏳
${deploymentTable}

${renderTestsSection(testStatuses, deploymentUrl, preDeploy)}`;
    }

    // Deployment succeeded: the preview site is live. Tests are reported separately.
    const deploymentTable = renderStatusTable([
      { label: 'Docs', status: `[✅ View](${deploymentUrl})` },
      { label: 'Storybook', status: `[✅ View](${deploymentUrl}/storybook)` },
      { label: 'e2e server', status: `[✅ View](${deploymentUrl}/e2e)` },
      ...(packageLinks ? [{ label: 'Packages', status: packageLinks }] : []),
    ]);

    const testsState = getOverallTestsState(testStatuses, preDeploy);
    const overall =
      testsState === 'failure' ? '❌ Failed' : testsState === 'success' ? '✅ Successful' : '⏳ In Progress';

    return `## ${overall}${buildText} - ${sha}

### 📦 Deployment ✅
${deploymentTable}

${renderTestsSection(testStatuses, deploymentUrl, preDeploy)}`;
  },
};

type TestsState = 'success' | 'failure' | 'pending';

function getOverallTestsState(testStatuses: TestCheckStatus[], preDeploy: boolean): TestsState {
  if (preDeploy || testStatuses.length === 0) return 'pending';
  if (testStatuses.some((t) => t.conclusion === 'failure')) return 'failure';
  if (testStatuses.some((t) => t.conclusion === 'pending')) return 'pending';
  // Only success/skipped remain - the run is successful.
  return 'success';
}

const testStatusEmoji: Record<TestCheckConclusion, string> = {
  success: '✅',
  failure: '❌',
  pending: '⏳',
  skipped: '⏭️',
};

function renderTestsSection(testStatuses: TestCheckStatus[], deploymentUrl: string | undefined, preDeploy: boolean) {
  const testsState = getOverallTestsState(testStatuses, preDeploy);
  const heading =
    testsState === 'failure' ? '🧪 CI Checks ❌' : testsState === 'success' ? '🧪 CI Checks ✅' : '🧪 CI Checks ⏳';

  // Map known test labels to their published report path.
  const reportPath: Record<string, string> = {
    'Playwright VRT': 'vrt-report',
    'Playwright A11Y': 'a11y-report',
  };

  const rows =
    testStatuses.length > 0
      ? testStatuses.map(({ label, conclusion }) => {
          const path = reportPath[label];
          const reportLink = !preDeploy && path && deploymentUrl ? ` [report](${deploymentUrl}/${path})` : '';
          const status = getTestStatusLabel(conclusion, preDeploy, reportLink);
          return { label, status };
        })
      : [
          { label: 'Playwright VRT', status: '⏳ Running' },
          { label: 'Playwright A11Y', status: '⏳ Running' },
          { label: 'Jest', status: '⏳ Running' },
          { label: 'Eslint', status: '⏳ Running' },
          { label: 'Prettier', status: '⏳ Running' },
          { label: 'Types', status: '⏳ Running' },
          { label: 'API', status: '⏳ Running' },
        ];

  return `### ${heading}
${renderStatusTable(rows)}`;
}

function getTestStatusLabel(conclusion: TestCheckConclusion, preDeploy: boolean, reportLink: string): string {
  switch (conclusion) {
    case 'pending':
      return `${testStatusEmoji.pending} ${preDeploy ? 'Running' : 'Pending'}`;
    case 'success':
      return `${testStatusEmoji.success} Passed${reportLink}`;
    case 'skipped':
      return `${testStatusEmoji.skipped} Skipped`;
    case 'failure':
    default:
      return `${testStatusEmoji.failure} Failed${reportLink}`;
  }
}

function renderStatusTable(rows: { label: string; status: string }[]): string {
  return ['| Step | Status |', '| --- | --- |', ...rows.map(({ label, status }) => `| ${label} | ${status} |`)].join(
    '\n',
  );
}

function getPackageLinks(
  packagesUrl?: string,
  packageTarballUrl?: string,
  commitPackageTarballUrl?: string,
  commitPackageTarballLabel?: string,
): string | undefined {
  if (!packagesUrl && !packageTarballUrl && !commitPackageTarballUrl) return undefined;

  const links = [];
  if (packagesUrl) {
    links.push(`[Packages](${packagesUrl})`);
  }
  if (packageTarballUrl) {
    links.push(`[pr.tgz](${packageTarballUrl})`);
  }
  if (commitPackageTarballUrl) {
    links.push(`[${commitPackageTarballLabel ?? 'commit.tgz'}](${commitPackageTarballUrl})`);
  }
  return links.join(' · ');
}

type Comments = typeof comments;

export function getComment<T extends keyof Comments>(key: T, ...args: Parameters<Comments[T]>): string {
  // @ts-ignore - conditional args
  const comment = comments[key](...args);
  return generateMsg(key, comment);
}
