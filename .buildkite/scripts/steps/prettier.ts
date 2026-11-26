/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { exec, startGroup, pnpmInstall } from '../../utils';

void (async () => {
  await pnpmInstall();

  startGroup('Running prettier checks');

  await exec('pnpm prettier:check');

  startGroup('Checking pnpm-lock.yaml is deduplicated');

  await exec('pnpm dedupe --check', {
    failureMsg: 'pnpm-lock.yaml has duplicate dependencies, run `pnpm dedupe` and commit the lockfile',
  });
})();
