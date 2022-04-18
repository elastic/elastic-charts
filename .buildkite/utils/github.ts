/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAppAuth } from '@octokit/auth-app';
import { retry } from '@octokit/plugin-retry';
import { Octokit } from '@octokit/rest';
import { getMetadata, metadataExists, setMetadata } from 'buildkite-agent-node';
import minimatch, { IOptions as MinimatchOptions } from 'minimatch';
import { Optional } from 'utility-types';

import { bkEnv, getJobTimingStr } from './buildkite';
import { getNumber } from './common';
import { MetaDataKeys } from './constants';
import { OctokitParameters, FileDiff } from './types';

if (!process.env.GITHUB_AUTH) throw new Error('GITHUB_AUTH env variable must be defined');

const MyOctokit = Octokit.plugin(retry);
export const octokit = new MyOctokit({
  authStrategy: createAppAuth,
  auth: JSON.parse(process.env.GITHUB_AUTH),
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

const getDefaultDescription = async (state: OctokitParameters<'repos/create-commit-status'>['state']) => {
  const timingStr = await getJobTimingStr();
  if (state === 'success') return `Successful after ${timingStr}`;
  if (state === 'failure') return `Failure after ${timingStr} - see logs...`;
  if (state === 'error') return `Errored after ${timingStr} - see logs...`;
};

export const commitStatusIsPennding = async (context = bkEnv.context, userRef?: string): Promise<boolean> => {
  const ref = userRef ?? bkEnv.commit;
  if (!ref) throw new Error(`Failed to get status, no ref available`);
  if (!context) throw new Error(`Failed to set status, no context available`);

  const { data } = await octokit.repos.listCommitStatusesForRef({
    ...defaultGHOptions,
    ref,
  });
  return data.find((status) => status.context === context)?.state === 'pending' ?? false;
};

export const setStatus = async (
  { state, context, ...options }: Optional<OctokitParameters<'repos/create-commit-status'>, 'sha'>,
  checkPending = false,
) => {
  if (process.env.BLOCK_REQUESTS) return;
  const sha = options.sha ?? bkEnv.commit;
  if (!sha) throw new Error(`Failed to set status, no sha available`);
  if (!context) throw new Error(`Failed to set status, no context available`);
  if (checkPending && (await commitStatusIsPennding(context, sha))) return;

  const description = options.description ?? (await getDefaultDescription(state));

  try {
    await octokit.repos.createCommitStatus({
      ...defaultGHOptions,
      target_url: bkEnv.jobUrl,
      sha,
      ...options,
      description,
      context,
      state,
    });
  } catch (error) {
    console.error(`Failed to set status for sha [${sha}]`);
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
  if (!bkEnv.pullRequest) return [];
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
