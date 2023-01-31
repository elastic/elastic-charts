/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { components } from '@octokit/openapi-types';
import axios, { AxiosInstance } from 'axios';

import { ProbotEventPayload } from './../github/types';
import { BuildkiteBuild, BuildkiteTriggerBuildOptions, PullRequestBuildEnv } from './types';
import { getConfig } from '../config';
import { checkCommitFn } from '../github/utils';

export type PRBuildkiteBuild = BuildkiteBuild;

class Buildkite {
  pipelineSlug: string;
  http: AxiosInstance;
  agentHttp?: AxiosInstance;

  constructor() {
    const { pipelineSlug, token, agentsToken } = getConfig().buildkite;
    this.pipelineSlug = pipelineSlug;
    this.http = axios.create({
      baseURL: 'https://api.buildkite.com/v2',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // TODO enable this for buildkite annotations, etc.
    if (agentsToken) {
      this.agentHttp = axios.create({
        baseURL: 'https://agent.buildkite.com/v3',
        headers: {
          Authorization: `Token ${agentsToken}`,
        },
      });
    }
  }

  async graphql<Response>(query: string) {
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

  async getRunningBuilds(sha: string, branch?: string): Promise<BuildkiteBuild[]> {
    const { status, data } = await this.http.get('builds', {
      params: {
        commit: sha,
        branch,
        state: ['running', 'scheduled'],
      },
    });

    if (status !== 200) throw new Error('Failed to get builds');
    return data;
  }

  async cancelRunningBuilds(sha: string, preCancel?: (url?: string) => Promise<void> | void, branch?: string) {
    const builds = await this.getRunningBuilds(sha, branch);

    if (preCancel) {
      await preCancel(builds?.[0]?.web_url);
    }

    await Promise.all(
      builds.map(async ({ number }) => {
        const url = `organizations/elastic/pipelines/${this.pipelineSlug}/builds/${number}/cancel`;
        const { status } = await this.http.put(url);
        if (status !== 200) throw new Error(`Failes to cancel build #${number}`);
        else console.log(`cancelled build #${number}`);
      }),
    );
  }

  /**
   * Create build on buildkite
   * see https://buildkite.com/docs/apis/rest-api/builds#create-a-build
   */
  async triggerBuild<
    E extends Record<string, any> = Record<string, never>,
    MD extends Record<string, any> = Record<string, never>,
    PR extends Record<string, any> = Record<string, never>,
  >(options: BuildkiteTriggerBuildOptions<E, MD>): Promise<BuildkiteBuild<E, MD, PR>> {
    // TODO build out separate pipelines to handle tasks on a run-as-needed basis
    const url = `organizations/elastic/pipelines/${this.pipelineSlug}/builds`;

    console.log(`Triggering pipeline '${this.pipelineSlug}' against ${options.branch}...`);

    try {
      const response = await this.http.post(url, options);

      if (response.status !== 201) {
        throw new Error(`Error: failed to create buildkite build.\n\n${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, statusText, data } = error.response;
        throw new Error(`${status} - ${statusText}: ${data.message}`);
      }

      throw error;
    }
  }
}

export const buildkiteClient = new Buildkite();

export function getPRBuildParams(
  {
    head,
    base,
    number,
    maintainer_can_modify,
    labels = [],
  }: components['schemas']['pull-request'] | ProbotEventPayload<'pull_request'>['pull_request'],
  { commit }: components['schemas']['commit'],
  updateVrt?: boolean,
): PullRequestBuildEnv {
  const updateScreenshots = updateVrt ?? checkCommitFn(commit.message)('updateScreenshots');
  return {
    GITHUB_PR_NUMBER: number.toString(),
    GITHUB_PR_TARGET_BRANCH: base.ref,
    GITHUB_PR_BASE_OWNER: base.repo.owner.login,
    GITHUB_PR_BASE_REPO: base.repo.name,
    GITHUB_PR_OWNER: head.repo!.owner.login,
    GITHUB_PR_REPO: head.repo!.name,
    GITHUB_PR_BRANCH: head.ref,
    GITHUB_PR_TRIGGERED_SHA: head.sha,
    GITHUB_PR_LABELS: labels.map((label) => label.name).join(','),
    GITHUB_PR_MAINTAINER_CAN_MODIFY: String(
      // TODO improve this check for is base repo
      maintainer_can_modify || base.repo.owner.login === getConfig().github.env.repo.owner,
    ),
    ECH_STEP_PLAYWRIGHT_UPDATE_SCREENSHOTS: String(updateScreenshots),
  };
}

interface JobStep {
  passed: boolean;
  url: string | null;
  state: JobState;
  key: string;
}

export async function getBuildJobs(buildId: string, stepKey?: string): Promise<JobStep[]> {
  const jobQuery = stepKey ? `first: 100, step: { key: "${stepKey}" }` : 'first: 100';
  const { data } = await buildkiteClient.graphql<BuildJobsReponse>(`query getBuildJobs {
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
