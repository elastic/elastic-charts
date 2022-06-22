/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { components } from '@octokit/openapi-types';
import axios, { AxiosInstance } from 'axios';

import { getConfig } from '../config';
import { checkCommitFn } from '../github/utils';
import { ProbotEventPayload } from './../github/types';
import { BuildkiteBuild, BuildkiteTriggerBuildOptions, PullRequestBuildEnv } from './types';

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

  async cancelRunningBuilds(sha: string, preCancel?: (url: string) => Promise<void> | void, branch?: string) {
    const builds = await this.getRunningBuilds(sha, branch);

    if (preCancel && builds[0]) {
      await preCancel(builds[0].web_url);
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
): PullRequestBuildEnv {
  const updateScreenshots = checkCommitFn(commit.message)('updateScreenshots', true);
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
    GITHUB_PR_MAINTAINER_CAN_MODIFY: String(maintainer_can_modify),
    ECH_STEP_PLAYWRIGHT_UPDATE_SCREENSHOTS: String(updateScreenshots),
  };
}
