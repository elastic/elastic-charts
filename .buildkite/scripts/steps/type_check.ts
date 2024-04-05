/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { exec, startGroup, yarnInstall } from '../../utils';

void (async () => {
  await yarnInstall();
  // TODO: fix this to where we can install only the necessary packages in one script
  await yarnInstall('e2e');
  await yarnInstall('docs');
  await yarnInstall('.buildkite');
  await yarnInstall('github_bot');

  startGroup('Running type checks');

  await exec('yarn typecheck:all');
})();
