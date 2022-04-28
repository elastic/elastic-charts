/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bkEnv, compress, createDeploymentStatus, exec, yarnInstall } from '../../utils';

void (async () => {
  yarnInstall();

  await createDeploymentStatus({ state: 'pending' });

  exec('yarn build', {
    cwd: 'storybook',
    env: {
      NODE_ENV: bkEnv.branch === 'master' ? 'production' : 'development',
    },
  });

  const outDir = `.out`;
  await compress({
    src: outDir,
    dest: '.buildkite/artifacts/storybook.gz',
  });
})();
