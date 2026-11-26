/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { exec, pnpmInstall, ROOT_PROJECTS, startGroup } from '../../utils';

void (async () => {
  await pnpmInstall([...ROOT_PROJECTS, 'charts-e2e', 'elastic-charts-docs']);

  startGroup('Running type checks');

  await exec('pnpm typecheck:all');
})();
