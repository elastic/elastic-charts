/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bkEnv, compress, createDeploymentStatus, exec, startGroup, yarnInstall } from '../../utils';

void (async () => {
  await yarnInstall();

  await createDeploymentStatus({ state: 'pending' });

  startGroup('Building storybook');
  await exec('yarn build', {
    cwd: 'storybook',
    env: {
      NODE_ENV: bkEnv.isMainBranch ? 'production' : 'development',
    },
  });

  const outDir = `.out`;
  await compress({
    src: outDir,
    dest: '.buildkite/artifacts/storybook.gz',
  });
})();
