/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { exec, yarnInstall, compress, startGroup, bkEnv } from '../../utils';
import { createDeploymentStatus, createOrUpdateDeploymentComment } from '../../utils/deployment';

void (async () => {
  await yarnInstall();

  if (bkEnv.isPullRequest) {
    await createOrUpdateDeploymentComment({
      state: 'pending',
    });
  } else {
    await createDeploymentStatus({ state: 'pending' });
  }

  startGroup('Generating e2e server files');
  const generateStartedAt = Date.now();
  await exec('yarn test:e2e:generate');
  console.log(`[timing] Generated e2e server files in ${((Date.now() - generateStartedAt) / 1000).toFixed(1)}s`);

  startGroup('Building e2e server');
  const buildStartedAt = Date.now();
  console.log('[build] Running `yarn test:e2e:server:build` with webpack progress/profile/stats enabled');
  await exec('yarn test:e2e:server:build', {
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--openssl-legacy-provider',
    },
  });
  console.log(`[timing] Built e2e server in ${((Date.now() - buildStartedAt) / 1000).toFixed(1)}s`);

  const dest = '.buildkite/artifacts/e2e_server.gz';
  await compress({
    src: './e2e_server/.out',
    dest,
  });
})();
