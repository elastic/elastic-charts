/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { bkEnv } from './buildkite';

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
 * TODO update this to be have a single source of truth btw here and github_bot/src/build.ts
 */
export const getBuildConfig = (): BuildConfig => {
  const isMaster = bkEnv.branch === 'master';
  return {
    main: { name: '@elastic/datavis CI', id: 'main' },
    jobs: [
      { name: 'Types', id: 'types' },
      { name: 'API', id: 'api' },
      { name: 'Build - e2e server', id: 'build_e2e' },
      { name: 'Build - Storybook', id: 'build_storybook' },
      { name: 'Eslint', id: 'eslint' },
      { name: 'Prettier', id: 'prettier' },
      { name: 'Deploy - firebase', id: 'deploy_fb' },
      ...(isMaster ? [{ name: 'Deploy - GitHub Pages', id: 'deploy_ghp' }] : []),
      { name: 'Jest', id: 'jest' },
      { name: 'Playwright e2e', id: 'playwright' },
    ],
  };
};

export const getJobCheckName = (checkId: string) => {
  const { main, jobs } = getBuildConfig();
  const job = [main, ...jobs].find(({ id }) => id === checkId);
  if (!job) {
    console.log('getJobCheckName');
    console.log([main, ...jobs]);

    throw new Error('Failed to find check name from step id');
  }
  return job.name;
};
