/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RestEndpointMethodTypes } from '@octokit/rest';
import { getMetadata, setMetadata, metadataExists } from 'buildkite-agent-node';
import { Optional } from 'utility-types';

import { bkEnv, getPreviousDeployCommitSha } from './buildkite';
import { getNumber } from './common';
import { MetaDataKeys } from './constants';
import { getDeploymentUrl } from './firebase';
import { octokit, defaultGHOptions, getComment, commentByKey } from './github';
import { OctokitParameters } from './types';

export interface UpdateDeploymentCommentOptions {
  sha?: string;
  state: 'pending' | 'success' | 'failure';
  deploymentUrl?: string;
  previousSha?: string;
  errorCmd?: string;
  errorMsg?: string;
  jobLink?: string;
  preDeploy?: boolean;
}

export async function createOrUpdateDeploymentComment(options: UpdateDeploymentCommentOptions) {
  const skipDeployment = await getMetadata(MetaDataKeys.skipDeployment);
  console.log('MetaDataKeys.skipDeployment', skipDeployment);
  const deploymentStatus = await getMetadata(MetaDataKeys.deploymentStatus);

  if (
    process.env.BLOCK_REQUESTS ||
    !bkEnv.isPullRequest ||
    skipDeployment === 'true' ||
    deploymentStatus === options.state
  )
    return;

  const { state, sha = bkEnv.commit! } = options;

  await setMetadata(MetaDataKeys.deploymentStatus, state);

  const previousCommentId = await getMetadata(MetaDataKeys.deploymentCommentId);

  if (state === 'pending' && !previousCommentId) {
    // initial cleanup - delete previous comments
    const { data: botComments } = await octokit.issues.listComments({
      ...defaultGHOptions,
      issue_number: bkEnv.pullRequestNumber!,
    });
    const deployComments = botComments.filter(commentByKey('deployment'));
    await Promise.all(
      deployComments.map(async ({ id }) => {
        await octokit.issues.deleteComment({
          ...defaultGHOptions,
          comment_id: id,
        });
      }),
    );
    const previousSha = await getPreviousDeployCommitSha();
    if (previousSha) {
      await setMetadata(MetaDataKeys.deploymentPreviousSha, previousSha);
    }
  }

  if (previousCommentId) {
    await octokit.issues.deleteComment({
      ...defaultGHOptions,
      comment_id: Number(previousCommentId),
    });
  }

  const deploymentUrl = options.deploymentUrl ?? (await getDeploymentUrl());
  const previousSha = options.previousSha ?? (await getMetadata(MetaDataKeys.deploymentPreviousSha));
  const commentBody = getComment('deployment', { ...options, state, sha, deploymentUrl, previousSha });

  const {
    data: { id },
  } = await octokit.issues.createComment({
    ...defaultGHOptions,
    issue_number: bkEnv.pullRequestNumber!,
    body: commentBody,
  });

  await setMetadata(MetaDataKeys.deploymentCommentId, id.toString());
}

/**
 * Must clear previous deployments when deployment `transient_environment` is t`rue`
 */
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

function getDeploymentTask() {
  return bkEnv.isPullRequest ? `deploy:pr:${bkEnv.pullRequestNumber}` : `deploy:${bkEnv.branch}`;
}

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
