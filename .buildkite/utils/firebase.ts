/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { writeSync } from 'fs';

import { setMetadata } from 'buildkite-agent-node';
import { fileSync } from 'tmp';

import { bkEnv, startGroup } from './buildkite';
import { DEFAULT_FIREBASE_URL, MetaDataKeys } from './constants';
import { exec } from './exec';
import {
  octokit,
  commentByKey,
  createDeploymentStatus,
  updatePreviousDeployments,
  defaultGHOptions,
  getComment,
} from './github';

// Set up Google Application Credentials for use by the Firebase CLI
// https://cloud.google.com/docs/authentication/production#finding_credentials_automatically
function createGACFile() {
  const tmpFile = fileSync({ postfix: '.json' });
  const gac = process.env.FIREBASE_AUTH;
  if (!gac) throw new Error('Error: unable to find FIREBASE_AUTH');
  writeSync(tmpFile.fd, gac);

  return tmpFile.name;
}

interface DeployOptions {
  expires?: string;
  redeploy?: boolean;
}

export const firebaseDeploy = async (opt: DeployOptions = {}) => {
  const expires = opt.expires ?? '7d';

  startGroup('Deploying to firebase');

  const channelId = bkEnv.isPullRequest ? `pr-${bkEnv.pullRequestNumber!}` : bkEnv.isMainBranch ? null : bkEnv.branch;

  const gacFile = createGACFile();
  const command = channelId
    ? `npx firebase-tools hosting:channel:deploy ${channelId} --expires ${expires} --no-authorized-domains --json`
    : `npx firebase-tools deploy --only hosting --json`;
  const stdout = await exec(command, {
    cwd: './e2e_server',
    stdio: 'pipe',
    env: {
      ...process.env,
      GOOGLE_APPLICATION_CREDENTIALS: gacFile,
    },
    async onFailure() {
      await createDeploymentStatus({
        state: 'failure',
      });
    },
  });

  const { result, status } = JSON.parse(stdout) as DeployResult;

  if (status === 'success') {
    const deploymentUrl = 'hosting' in result ? DEFAULT_FIREBASE_URL : result['ech-e2e-ci'].url;
    if (!deploymentUrl) throw new Error('Error: No url found for deployments');
    console.log(`Successfully deployed to ${deploymentUrl}`);

    await setMetadata(MetaDataKeys.deploymentUrl, deploymentUrl);

    if (bkEnv.isPullRequest) {
      // deactivate old deployments
      await updatePreviousDeployments();

      const { data: botComments } = await octokit.issues.listComments({
        ...defaultGHOptions,
        issue_number: bkEnv.pullRequestNumber!,
      });
      const deployComments = botComments.filter((c) => commentByKey('deployments')(c.body));
      await Promise.all(
        deployComments.map(async ({ id }) => {
          await octokit.issues.deleteComment({
            ...defaultGHOptions,
            comment_id: id,
          });
        }),
      );
      await octokit.issues.createComment({
        ...defaultGHOptions,
        issue_number: bkEnv.pullRequestNumber!,
        body: getComment('deployments', deploymentUrl, bkEnv.commit!),
      });
    }
    await createDeploymentStatus({
      state: 'success',
      environment_url: deploymentUrl,
    });
    return deploymentUrl;
  } else {
    throw new Error(`Error: Firebase deployment resulted in ${status}`);
  }
};

interface DeployResult {
  status: string;
  result:
    | {
        'ech-e2e-ci': {
          site: string;
          url: string;
          version: string;
          expireTime: string;
        };
      }
    | {
        hosting: string;
      };
}
