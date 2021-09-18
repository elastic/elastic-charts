import * as core from '@actions/core';
import * as github from '@actions/github';
import { createActionAuth } from '@octokit/auth-action';
import { StatusEvent } from '@octokit/webhooks-definitions/schema';
import intersection from 'lodash.intersectionby';

type GHApi = ReturnType<typeof github.getOctokit>;

const PR_CHECK_NAME = 'Sync';
const MATRIX_TITLE_PREFIX = 'PR #';

interface Inputs {
  baseRef: string;
  baseSha: string;
  headSha: string;
  statusContext: string;
  limit: number;
  prNumber: string;
  silent: boolean;
}

function getInputs(): Inputs {
  return {
    baseRef: core.getInput('base-ref'),
    baseSha: core.getInput('base-sha'),
    headSha: core.getInput('head-sha'),
    statusContext: core.getInput('status-context'),
    limit: Number(core.getInput('limit')),
    prNumber: core.getInput('pr-number'),
    silent: core.getBooleanInput('silent'),
  };
}

/**
 * GitHub `pull_request` triggers automatically create a check run and lists it under the PR
 * Checks. This is a helper to grab the right urls either case, a pr or a push to a special branch.
 */
async function getCheckRunUrl(
  octokit: GHApi,
  ref: string,
  isPrEvent: boolean,
  prNumber: string,
): Promise<string | undefined> {
  // for pull-requests to find triggered run:
  if (isPrEvent) {
    const { data } = await octokit.rest.checks.listForRef({
      ...github.context.repo,
      check_name: PR_CHECK_NAME,
      ref,
    });

    return data.check_runs[0]?.html_url ?? undefined;
  }

  if (!prNumber) {
    core.warning('pr-number not defined. Must include pr-number to fetch target url for check run');
    return;
  }

  // for push to find matrix run
  const { data } = await octokit.rest.actions.listJobsForWorkflowRun({
    ...github.context.repo,
    run_id: github.context.runId,
  });

  const testString = `${MATRIX_TITLE_PREFIX}${prNumber}`;

  return data.jobs.find(({ name }) => name.startsWith(testString))?.html_url ?? undefined;
}

async function setStatusFn(octokit: GHApi, { headSha, baseSha, statusContext: context, prNumber }: Inputs) {
  const isPr = github.context.eventName.startsWith('pull_request');
  const ref = isPr ? headSha : baseSha;
  const target_url = await getCheckRunUrl(octokit, ref, isPr, prNumber);

  return (state: StatusEvent['state'], description: string) => {
    core.info(`state: ${state}`);
    core.info(`description: ${description}`);

    octokit.rest.repos.createCommitStatus({
      ...github.context.repo,
      sha: headSha,
      context,
      state,
      description,
      target_url,
    });
  };
}

const pluralWords = {
  commit: 'commits',
  screenshot: 'screenshots',
};
function pluralize(word: keyof typeof pluralWords, count: number) {
  return count === 1 ? word : pluralWords[word];
}

async function run() {
  const inputs = getInputs();
  const { token } = await createActionAuth()();
  const octokit = await github.getOctokit(token);
  const setStatus = await setStatusFn(octokit, inputs);
  const setFailed = (msg: string | Error) => inputs.silent ? core.warning(msg) : core.setFailed(msg);

  setStatus('pending', 'Checking if PR is up-to-date.');

  try {
    const { data: baseCompare } = await octokit.rest.repos.compareCommitsWithBasehead({
      ...github.context.repo,
      basehead: `${inputs.baseRef}...${inputs.baseSha}`,
    });

    if (baseCompare.behind_by === 0) {
      setStatus('success', 'PR is up-to-date with upstream base.');
      return;
    }

    if (baseCompare.behind_by > inputs.limit) {
      const message = `PR is ${baseCompare.behind_by} ${pluralize(
        'commit',
        baseCompare.behind_by,
      )} behind. Please merge with ${inputs.baseRef}`;
      setStatus('failure', message);
      setFailed(message);
      return;
    }

    const { data: headCompare } = await octokit.rest.repos.compareCommitsWithBasehead({
      ...github.context.repo,
      basehead: `${inputs.baseSha}...${inputs.headSha}`,
    });

    if (baseCompare.files && headCompare.files) {
      // files changed in base since pr last synced
      const touchedFiles = intersection(baseCompare.files, headCompare.files, ({ filename }) => filename);
      const vrtFiles = touchedFiles.filter(
        ({ filename }) =>
          filename.startsWith('integration/tests/__image_snapshots__/') && !filename.includes('/__diff_output__/'),
      );
      const vrtFileCount = vrtFiles.length;

      if (vrtFileCount > 0) {
        const message = `PR is behind by ${baseCompare.behind_by} ${pluralize(
          'commit',
          baseCompare.behind_by,
        )} with ${vrtFileCount} stale VRT ${pluralize('screenshot', baseCompare.behind_by)}. Please merge with ${
          inputs.baseRef
        }.`;
        setStatus('failure', message);
        setFailed(message);
      } else {
        const message = `PR is behind by ${baseCompare.behind_by} ${pluralize(
          'commit',
          baseCompare.behind_by,
        )} with 0 stale VRT screenshots.`;
        setStatus('success', message);
      }
    }
  } catch (e) {
    const error = e as Error;
    setStatus('error', 'Failed to check PR status');

    core.error(error);
    core.setFailed(error);
  }
}

run();
