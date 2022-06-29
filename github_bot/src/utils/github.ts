/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAppAuth } from '@octokit/auth-app';
import { retry } from '@octokit/plugin-retry';
import { Octokit } from '@octokit/rest';

import { getConfig } from '../config';

const MyOctokit = Octokit.plugin(retry);

// TODO remove class after testing and once the app permissions include org:user:read
class Github {
  octokit: Octokit;
  orgOctokit: Octokit;
  repoParams = getConfig().github.env.repo;

  constructor() {
    const { github } = getConfig();

    this.octokit = new MyOctokit({
      authStrategy: createAppAuth,
      auth: github.auth,
    });

    this.orgOctokit = new MyOctokit({
      auth: github.token,
    });
  }
}

export const githubClient = new Github();
