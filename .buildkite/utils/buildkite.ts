/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import axios from 'axios';
import { getBuildkiteEnv, getMetadata, setMetadata } from 'buildkite-agent-node';

import { ECH_CHECK_ID } from './constants';
import { exec } from './exec';

export const uploadPipeline = (pipelineContent: any) => {
  const str = typeof pipelineContent === 'string' ? pipelineContent : JSON.stringify(pipelineContent);

  if (process.env.TEST_BK_PIPELINE) {
    console.log(JSON.stringify(JSON.parse(str), null, 2));
    return;
  }

  if (process.env.DEBUG_PIPELINE) {
    console.log(JSON.stringify(JSON.parse(str), null, 2));
  }

  exec('buildkite-agent pipeline upload', {
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
  const updateScreenshots = isPullRequest ? process.env.UPDATE_SCREENSHOTS === 'true' : false;
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
    updateScreenshots,
    pullRequestNumber,
    buildUrl: env.buildUrl,
    canModifyPR: process.env.GITHUB_PR_MAINTAINER_CAN_MODIFY === 'true',
    jobUrl: env.jobId ? `${env.buildUrl}#${env.jobId}` : undefined,
    steps: {
      playwright: {
        updateScreenshots: process.env.ECH_STEP_PLAYWRIGHT_UPDATE_SCREENSHOTS === 'true',
      },
    },
  };
})();

/**
 * Creates start of group in job logs
 * https://buildkite.com/docs/pipelines/managing-log-output
 */
export const startGroup = (msg: string) => console.log(`--- ${msg}`);

export const downloadArtifacts = (query: string, step?: string, destination = '.', build?: string) => {
  startGroup(`Downloading artifacts${step ? ` from step: ${step}` : ''}`);
  const dest = destination.endsWith('/') || destination === '.' ? destination : `${destination}/`;
  const stepArg = step ? ` --step ${step}` : '';
  const q = query.includes('*') ? `"${query}"` : query;
  const buildId = build ?? bkEnv.buildId;
  exec(`buildkite-agent artifact download ${q} ${dest}${stepArg} --build ${buildId}`);
};

export const uploadArtifacts = (query: string) => {
  const q = query.includes('*') ? `"${query}"` : query;
  startGroup(`Uploading artifacts matching "${q}"`);
  exec(`buildkite-agent artifact upload ${q}`);
};

function getEnvNumber(key: string) {
  const stringValue = getEnvString(key);
  if (stringValue === undefined) {
    return undefined;
  }

  const value = parseInt(stringValue);
  return value === NaN ? undefined : value;
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

export const getJobMetadata = async (prop: string) => {
  return await getMetadata(`${bkEnv.jobId}__${prop}`);
};

export const setJobMetadata = async (prop: string, value: string) => {
  await setMetadata(`${bkEnv.jobId}__${prop}`, value);
};

export async function getJobTiming(jobId = bkEnv.jobId) {
  if (!jobId) throw new Error(`Error: no job id found [${jobId}]`);

  const { data } = await buildkiteGQLQuery<JobTimingReponse>(`query getJobTimings {
    job(uuid: "${jobId}") {
      ... on JobTypeCommand {
        startedAt
        finishedAt
        canceledAt
      }
    }
  }`);
  const { startedAt, finishedAt, canceledAt } = data.job;
  if (!startedAt) {
    throw new Error(`Error: unable to determine start time for job [${jobId}]`);
  }
  const date1 = new Date(startedAt);
  const end = finishedAt || canceledAt;
  const date2 = end ? new Date(end) : new Date();
  const diffMs = Math.abs(date2.valueOf() - date1.valueOf());
  const diffMin = diffMs / 1000 / 60;
  const minutes = Math.floor(diffMin);
  const seconds = Math.floor((diffMin - minutes) * 60);

  return {
    minutes,
    seconds,
  };
}

export async function getJobTimingStr(): Promise<string> {
  const { minutes, seconds } = await getJobTiming();
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

interface JobTimingReponse {
  data: {
    job: {
      startedAt: string | null;
      finishedAt: string | null;
      canceledAt: string | null;
    };
  };
}

export async function getJobSteps(stepKey: string) {
  const buildId = bkEnv.buildId;

  if (!buildId) throw new Error(`Error: no job id found [${buildId}]`);

  const { data } = await buildkiteGQLQuery<JobStepsReponse>(`query getJobSteps {
    build(uuid: "${buildId}") {
      jobs(first: 100, step: { key: "${stepKey}" }) {
        edges {
          node {
            ... on JobTypeCommand {
              passed
              url
            }
          }
        }
      }
    }
  }`);
  return data?.build?.jobs?.edges.map(({ node }) => node) ?? [];
}

interface JobStepsReponse {
  data: {
    build: {
      jobs: {
        edges: {
          node: {
            passed: boolean;
            url: string | null;
          };
        }[];
      };
    };
  };
}
