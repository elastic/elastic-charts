/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import axios from 'axios';
import { getBuildkiteEnv, getMetadata, setMetadata, metadataExists } from 'buildkite-agent-node';

import { ECH_CHECK_ID } from './constants';
import { exec } from './exec';

export const uploadPipeline = async (pipelineContent: any) => {
  const str = typeof pipelineContent === 'string' ? pipelineContent : JSON.stringify(pipelineContent);

  if (process.env.TEST_BK_PIPELINE) {
    console.log(JSON.stringify(JSON.parse(str), null, 2));
    return;
  }

  if (process.env.DEBUG_PIPELINE) {
    console.log(JSON.stringify(JSON.parse(str), null, 2));
  }

  await exec('buildkite-agent pipeline upload', {
    input: str,
  });
};

/**
 * Buildkite environment variables
 *
 * TODO clean this up with new custom API env build variables
 */
export const bkEnv = (() => {
  const { pullRequest: _, branch: bkBranch, ...env } = getBuildkiteEnv();
  const branch = bkBranch && bkBranch.split(':').reverse()[0];
  const pullRequestNumber = getEnvNumber('BUILDKITE_PULL_REQUEST');
  const checkId = getEnvString(ECH_CHECK_ID);
  const isPullRequest = Boolean(pullRequestNumber);
  let username: string | undefined;

  if (isPullRequest) {
    const userRE = /^\b(?:git|https)\b:\/\/github\.com\/([^#./]+)\/[^#./]+\.git$/;
    const [, repoOwner] = userRE.exec(env.pullRequestRepo ?? '') ?? [];
    if (repoOwner !== 'elastic') {
      username = repoOwner;
    }
  }

  return {
    ...env,
    /**
     * Step context for commit status
     */
    branch,
    checkId,
    username,
    isPullRequest,
    isMaster: branch === 'master',
    pullRequestNumber,
    buildUrl: env.buildUrl,
    canModifyPR: process.env.GITHUB_PR_MAINTAINER_CAN_MODIFY === 'true',
    jobUrl: env.jobId ? `${env.buildUrl}#${env.jobId}` : undefined,
    steps: {
      playwright: {
        updateScreenshots: isPullRequest ? process.env.ECH_STEP_PLAYWRIGHT_UPDATE_SCREENSHOTS === 'true' : false,
      },
    },
  };
})();

/**
 * Creates start of group in job logs
 * https://buildkite.com/docs/pipelines/managing-log-output
 */
export const startGroup = (msg: string) => console.log(`--- ${msg}`);

export const downloadArtifacts = async (query: string, step?: string, destination = '.', build?: string) => {
  startGroup(`Downloading artifacts${step ? ` from step: ${step}` : ''}`);
  const dest = destination.endsWith('/') || destination === '.' ? destination : `${destination}/`;
  const stepArg = step ? ` --step ${step}` : '';
  const q = query.includes('*') ? `"${query}"` : query;
  const buildId = build ?? bkEnv.buildId;
  console.log('downloadArtifacts command');
  console.log(`buildkite-agent artifact download ${q} ${dest}${stepArg} --build ${buildId}`);

  await exec(`buildkite-agent artifact download ${q} ${dest}${stepArg} --build ${buildId}`);
};

export const searchArtifacts = async (query: string, step?: string, destination = '.', build?: string) => {
  startGroup(`Searching artifacts${step ? ` from step: ${step}` : ''}`);
  const dest = destination.endsWith('/') || destination === '.' ? destination : `${destination}/`;
  const stepArg = step ? ` --step ${step}` : '';
  const q = query.includes('*') ? `"${query}"` : query;
  const buildId = build ?? bkEnv.buildId;
  console.log('downloadArtifacts command');
  console.log(`buildkite-agent artifact search ${q} ${dest}${stepArg} --build ${buildId}`);

  await exec(`buildkite-agent artifact search ${q} ${dest}${stepArg} --build ${buildId}`);
};

export const uploadArtifacts = async (query: string) => {
  const q = query.includes('*') ? `"${query}"` : query;
  startGroup(`Uploading artifacts matching "${q}"`);
  await exec(`buildkite-agent artifact upload ${q}`);
};

function getEnvNumber(key: string) {
  const stringValue = getEnvString(key);
  if (stringValue === undefined) {
    return undefined;
  }

  const value = parseInt(stringValue);
  return Number.isNaN(value) ? undefined : value;
}

function getEnvString(key: string) {
  const value = process.env[key];
  return value && value !== '' ? value : undefined;
}

/**
 * Makes request to buildkite graphQL api
 */
export async function buildkiteGQLQuery<Response = any>(query: string) {
  const { data } = await axios.post<Response>(
    'https://graphql.buildkite.com/v1',
    { query },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BUILDKITE_TOKEN}`,
      },
    },
  );

  return data;
}

export const getJobMetadata = async (prop: string, required: boolean = false) => {
  const key = `${bkEnv.jobId}__${prop}`;
  if (required && !(await metadataExists(key))) {
    throw new Error(`Failed to find metaData key for "${key}"`);
  }
  const value = await getMetadata(key);
  console.log(`Found metaData value [${key}] -> ${value}`);
  return value;
};

export const setJobMetadata = async (prop: string, value: string) => {
  const key = `${bkEnv.jobId}__${prop}`;
  await setMetadata(key, value);
  console.log(`Set metaData value [${key}] -> ${value}`);
};

interface JobStep {
  passed: boolean;
  url: string | null;
  state: JobState;
  key: string;
}

export async function getBuildJobs(stepKey?: string): Promise<JobStep[]> {
  const buildId = bkEnv.buildId;

  if (!buildId) throw new Error(`Error: no job id found [${buildId}]`);

  const jobQuery = stepKey ? `first: 100, step: { key: "${stepKey}" }` : 'first: 100';
  const { data } = await buildkiteGQLQuery<BuildJobsReponse>(`query getBuildJobs {
    build(uuid: "${buildId}") {
      jobs(${jobQuery}) {
        edges {
          node {
            ... on JobTypeCommand {
              passed
              state
              url
              step {
                key
              }
            }
          }
        }
      }
    }
  }`);
  return (
    data?.build?.jobs?.edges.map(
      ({
        node: {
          step: { key },
          ...rest
        },
      }) => ({ ...rest, key }),
    ) ?? []
  );
}

interface BuildJobsReponse {
  data: {
    build: {
      jobs: {
        edges: {
          node: {
            passed: boolean;
            url: string | null;
            state: JobState;
            step: {
              key: string;
            };
          };
        }[];
      };
    };
  };
}

export const enum JobState {
  /**
   * The job has just been created and doesn't have a state yet
   */
  Pending = 'PENDING',

  /**
   * The job is waiting on a wait step to finish
   */
  Waiting = 'WAITING',

  /**
   * The job was in a WAITING state when the build failed
   */
  WaitingFailed = 'WAITING_FAILED',

  /**
   * The job is waiting on a block step to finish
   */
  Blocked = 'BLOCKED',

  /**
   * The job was in a BLOCKED state when the build failed
   */
  BlockedFailed = 'BLOCKED_FAILED',

  /**
   * This block job has been manually unblocked
   */
  Unblocked = 'UNBLOCKED',

  /**
   * This block job was in an UNBLOCKED state when the build failed
   */
  UnblockedFailed = 'UNBLOCKED_FAILED',

  /**
   * The job is waiting on a concurrency group check before becoming either LIMITED or SCHEDULED
   */
  Limiting = 'LIMITING',

  /**
   * The job is waiting for jobs with the same concurrency group to finish
   */
  Limited = 'LIMITED',

  /**
   * The job is scheduled and waiting for an agent
   */
  Scheduled = 'SCHEDULED',

  /**
   * The job has been assigned to an agent, and it's waiting for it to accept
   */
  Assigned = 'ASSIGNED',

  /**
   * The job was accepted by the agent, and now it's waiting to start running
   */
  Accepted = 'ACCEPTED',

  /**
   * The job is runing
   */
  Running = 'RUNNING',

  /**
   * The job has finished
   */
  Finished = 'FINISHED',

  /**
   * The job is currently canceling
   */
  Canceling = 'CANCELING',

  /**
   * The job was canceled
   */
  Canceled = 'CANCELED',

  /**
   * The job is timing out for taking too long
   */
  TimingOut = 'TIMING_OUT',

  /**
   * The job timed out
   */
  TimedOut = 'TIMED_OUT',

  /**
   * The job was skipped
   */
  Skipped = 'SKIPPED',

  /**
   * The jobs configuration means that it can't be run
   */
  Broken = 'BROKEN',

  /**
   * The job expired before it was started on an agent
   */
  Expired = 'EXPIRED',
}

export const jobStateMapping: Record<JobState, string> = {
  PENDING: 'Pending',
  WAITING: 'Waiting',
  WAITING_FAILED: 'Waiting Failed',
  BLOCKED: 'Blocked',
  BLOCKED_FAILED: 'Blocked Failed',
  UNBLOCKED: 'Unblocked',
  UNBLOCKED_FAILED: 'Unblocked Failed',
  LIMITING: 'Limiting',
  LIMITED: 'Limited',
  SCHEDULED: 'Scheduled',
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  RUNNING: 'Running',
  FINISHED: 'Finished',
  CANCELING: 'Canceling',
  CANCELED: 'Canceled',
  TIMING_OUT: 'TimingOut',
  TIMED_OUT: 'TimedOut',
  SKIPPED: 'Skipped',
  BROKEN: 'Broken',
  EXPIRED: 'Expired',
};
