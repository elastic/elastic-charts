/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import bodyParser from 'body-parser';
import type { ApplicationFunctionOptions } from 'probot';
import { Server, Probot } from 'probot';

import { setupBuildkiteRoutes } from './buildkite';
import { getConfig } from './config';
import { setupGithub } from './github';

const probotApp = (app: Probot, { getRouter }: ApplicationFunctionOptions) => {
  if (!getRouter) {
    throw new Error('probot getRouter is undefined');
  }

  setupGithub(app);

  // ngrok requires base path so this is only for development
  const bkRoute = getConfig().isDev ? '/' : '/buildkite';
  setupBuildkiteRoutes(getRouter(bkRoute));
};

async function startServer() {
  const config = getConfig();
  const server = new Server({
    ...config.server,
    Probot: Probot.defaults(config.probot),
  });

  server.expressApp.use(bodyParser.json());

  await server.load(probotApp);
  await server.start();
}

void startServer();
