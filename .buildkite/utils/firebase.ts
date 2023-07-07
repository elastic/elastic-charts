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
import { createDeploymentStatus, createOrUpdateDeploymentComment } from './deployment';
import { exec } from './exec';

// Set up Google Application Credentials for use by the Firebase CLI
// https://cloud.google.com/docs/authentication/production#finding_credentials_automatically
function createGACFile() {
  const gac = process.env.FIREBASE_AUTH;
  if (!gac) throw new Error('Error: unable to find FIREBASE_AUTH');
  const tmpFile = fileSync({ postfix: '.json' });
  writeSync(tmpFile.fd, gac);
  return tmpFile.name;
}

interface DeployOptions {
  expires?: string;
  redeploy?: boolean;
}

const getChannelId = () =>
  bkEnv.isPullRequest ? `pr-${bkEnv.pullRequestNumber!}` : bkEnv.isMainBranch ? null : bkEnv.branch;

export const firebaseDeploy = async (opt: DeployOptions = {}) => {
  const expires = opt.expires ?? '7d';

  startGroup('Deploying to firebase');

  const channelId = getChannelId();
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
    async onFailure(err) {
      if (bkEnv.isPullRequest) {
        await createOrUpdateDeploymentComment({
          state: 'failure',
          jobLink: bkEnv.jobUrl,
          errorMsg: err,
        });
      } else {
        await createDeploymentStatus({
          state: 'failure',
        });
      }
    },
  });

  const { result, status } = JSON.parse(stdout) as DeployResult;

  if (status === 'success') {
    const deploymentUrl = 'hosting' in result ? DEFAULT_FIREBASE_URL : result['ech-e2e-ci'].url;
    if (!deploymentUrl) throw new Error('Error: No url found for deployments');
    console.log(`Successfully deployed to ${deploymentUrl}`);

    await setMetadata(MetaDataKeys.deploymentUrl, deploymentUrl);

    if (bkEnv.isPullRequest) {
      await createOrUpdateDeploymentComment({
        state: 'success',
        deploymentUrl,
      });
    } else {
      await createDeploymentStatus({
        state: 'success',
        environment_url: deploymentUrl,
      });
    }
    return deploymentUrl;
  } else {
    throw new Error(`Error: Firebase deployment resulted in ${status}`);
  }
};

interface ChannelDeploymentInfo {
  status: string;
  result?: {
    url?: string;
  };
}

/**
 * Returns deployment id for given PR channel
 */
export async function getDeploymentUrl() {
  const channelId = getChannelId();
  const gacFile = createGACFile();
  const deploymentJson = await exec(`npx firebase hosting:channel:open ${channelId} --json`, {
    cwd: './e2e_server',
    stdio: 'pipe',
    env: {
      ...process.env,
      GOOGLE_APPLICATION_CREDENTIALS: gacFile,
    },
  });

  try {
    const info = JSON.parse(deploymentJson) as ChannelDeploymentInfo;
    return info?.result?.url || undefined;
  } catch {
    return undefined;
  }
}

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
