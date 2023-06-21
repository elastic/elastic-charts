/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { exec, yarnInstall } from '../../utils';
import { bkEnv, startGroup } from '../../utils/buildkite';
import { ChangeContext } from '../../utils/github';

void (async () => {
  const changes = new ChangeContext();
  await changes.init();
  const hasLintConfigChanges = changes.files.has([
    '**/.eslintrc.js',
    '**/.eslintignore',
    '.prettierignore',
    '.prettierrc.json',
    'tsconfig.lint.json',
    'tsconfig.json',
    'package.json',
    'yarn.lock',
  ]);

  await yarnInstall();
  // TODO: fix this to where we can install only the necessary packages in one script
  await yarnInstall('e2e');
  await yarnInstall('.buildkite');
  await yarnInstall('github_bot');

  // TODO: fix this to avoid requiring build to run linting
  // currently the storybook and others are loosely coupled to @elastic/charts/src
  // such that types point to the local source and not a packaged release
  await exec('yarn build:ts');

  if (bkEnv.isPullRequest && !hasLintConfigChanges) {
    const filesToLint = changes.files.filter('**/*.ts?(x)').join(' ');

    if (filesToLint.length > 0) {
      startGroup(`Running eslint checks - ${filesToLint.length} files`);

      await exec('yarn lint:it', {
        input: filesToLint,
      });
    }
  } else {
    startGroup('Running eslint checks - all files');
    await exec('yarn lint');
  }
})();
