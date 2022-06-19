/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

interface Job {
  name: string;
  id: string;
}

interface BuildConfig {
  main: Job;
  jobs: Job[];
}

/**
 * This config enabled updating of required check runs when build is skipped
 *
 * TODO update this to be have a single source of truth btw here and .buildkite/
 */
export const getBuildConfig = (isMaster: boolean): BuildConfig => ({
  main: { name: 'Datavis CI', id: 'main' },
  jobs: [
    { name: 'Types', id: 'types' },
    { name: 'API', id: 'api' },
    { name: 'Build - e2e server', id: 'build-e2e' },
    { name: 'Build - Storybook', id: 'build-storybook' },
    { name: 'Eslint', id: 'eslint' },
    { name: 'Prettier', id: 'prettier' },
    { name: 'Deploy - firebase', id: 'deploy-fb' },
    ...(isMaster ? [{ name: 'Deploy - GitHub pages', id: 'deploy-ghp' }] : []),
    { name: 'Jest', id: 'jest' },
    { name: 'Playwright', id: 'playwright' },
  ],
});
