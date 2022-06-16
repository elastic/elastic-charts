/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import axios, { AxiosInstance } from 'axios';

import { getConfig } from '../config';
import { BuildkiteBuild, BuildkiteTriggerBuildOptions } from './types';

export type PRBuildkiteBuild = BuildkiteBuild;

class Buildkite {
  pipelineSlug = 'elastic-charts-ci';
  http: AxiosInstance;
  agentHttp?: AxiosInstance;

  constructor() {
    const { buildkite } = getConfig();

    this.http = axios.create({
      baseURL: 'https://api.buildkite.com',
      headers: {
        Authorization: `Bearer ${buildkite.token}`,
      },
    });

    // TODO enable this for buildkite annotations, etc.
    if (buildkite.agentsToken) {
      this.agentHttp = axios.create({
        baseURL: 'https://agent.buildkite.com/v3',
        headers: {
          Authorization: `Token ${buildkite.agentsToken}`,
        },
      });
    }
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
    const url = `v2/organizations/elastic/pipelines/${this.pipelineSlug}/builds`;

    console.log(`Triggering pipeline '${this.pipelineSlug}' against ${options.branch}...`);

    try {
      const response = await this.http.post(url, options);

      if (response.status !== 201) {
        throw new Error(`Error: failed to create buildkite build.\n\n${response.statusText}`);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const { status, statusText, data } = error.response;
        throw new Error(`${status} - ${statusText}: ${data.message}`);
      }

      throw error;
    }
  }
}

export const buildkiteClient = new Buildkite();
