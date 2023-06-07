/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createDeploymentStatus, exec, yarnInstall, compress, startGroup } from '../../utils';

void (async () => {
  await yarnInstall();

  await createDeploymentStatus({ state: 'pending' });

  startGroup('Generating e2e server files');
  await exec('yarn test:e2e:generate');

  startGroup('Building e2e server');
  await exec('yarn test:e2e:server:build', {
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--openssl-legacy-provider',
    },
  });

  const dest = '.buildkite/artifacts/e2e_server.gz';
  await compress({
    src: './e2e_server/.out',
    dest,
  });
})();
