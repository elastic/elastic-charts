/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bkEnv, compress, exec, getOrCreateDeploymentUrl, pnpmInstall, ROOT_PROJECTS, startGroup } from '../../utils';
import { createDeploymentStatus, createOrUpdateDeploymentComment } from '../../utils/deployment';

void (async () => {
  await pnpmInstall([...ROOT_PROJECTS, 'elastic-charts-docs']);

  if (bkEnv.isPullRequest) {
    await createOrUpdateDeploymentComment({
      state: 'pending',
    });
  } else {
    await createDeploymentStatus({ state: 'pending' });
  }

  startGroup('Building docs - firebase');
  const firebaseChannelUrl = await getOrCreateDeploymentUrl();
  await exec('pnpm typedoc');
  await exec('pnpm build', {
    cwd: 'docs',
    env: {
      DOCUSAURUS_URL: firebaseChannelUrl,
      NODE_ENV: bkEnv.isMainBranch ? 'production' : 'development',
      NODE_OPTIONS: '--openssl-legacy-provider',
    },
  });

  const outDir = `docs/build`;

  await compress({
    src: outDir,
    dest: '.buildkite/artifacts/docs/firebase.gz',
  });

  if (bkEnv.isMainBranch) {
    startGroup('Building docs - github pages');
    await exec('pnpm build', {
      cwd: 'docs',
      env: {
        DOCUSAURUS_URL: 'https://elastic.github.io',
        DOCUSAURUS_BASE_URL: '/elastic-charts',
        NODE_ENV: 'production',
        NODE_OPTIONS: '--openssl-legacy-provider',
      },
    });

    await compress({
      src: outDir,
      dest: '.buildkite/artifacts/docs/github.gz',
    });
  }
})();
