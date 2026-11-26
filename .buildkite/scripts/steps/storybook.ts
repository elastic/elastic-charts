/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bkEnv, buildStorybookSite, compress, startGroup, storybookOutDir, yarnInstall } from '../../utils';
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

  startGroup('Building storybook');
  buildStorybookSite({
    nodeEnv: bkEnv.isMainBranch ? 'production' : 'development',
  });

  await compress({
    src: storybookOutDir,
    dest: '.buildkite/artifacts/storybook.gz',
  });
})();
