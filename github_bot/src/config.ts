/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';

import type { StrategyOptions } from '@octokit/auth-app';
import type { ServerOptions, Options } from 'probot/lib/types';

import type { Env } from './env';
import { getEnv } from './env';

type ConfigServerOptions = Omit<ServerOptions, 'Probot'>;
type ProbotOptions = Omit<Options, keyof ConfigServerOptions>;

interface Config {
  isDev: boolean;
  isProd: boolean;
  github: {
    auth: StrategyOptions;
    /**
     * Token used for org requests, since GH app does not have permission
     */
    token: string;
    env: Env;
  };
  buildkite: {
    token: string;
    /**
     * Nonce query param to *somewhat* validate buildkite webhooks
     */
    webhookNonce: string;
    agentsToken?: string;
    pipelineSlug: string;
  };
  server: ConfigServerOptions;
  probot: ProbotOptions;
}

let config: Config;

export const getConfig = (): Config => {
  if (config) return config;

  validateEnvKeys([
    'GITHUB_AUTH',
    'GITHUB_TOKEN',
    'BUILDKITE_TOKEN',
    'BUILDKITE_WEBHOOK_NONCE',
    'BUILDKITE_PIPELINE_SLUG',
  ]);

  const auth = JSON.parse(process.env.GITHUB_AUTH!) as StrategyOptions;
  const isProd = process.env.NODE_ENV === 'production';

  config = {
    isProd,
    isDev: !isProd,
    github: {
      auth,
      token: process.env.GITHUB_TOKEN!,
      env: getEnv(!isProd),
    },
    buildkite: {
      token: process.env.BUILDKITE_TOKEN!,
      agentsToken: process.env.BUILDKITE_AGENT_TOKEN,
      webhookNonce: process.env.BUILDKITE_WEBHOOK_NONCE!,
      pipelineSlug: process.env.BUILDKITE_PIPELINE_SLUG!,
    },
    server: {
      host: process.env.HOST,
      port: parseInt(process.env.PORT || ''),
      webhookProxy: process.env.WEBHOOK_PROXY_URL,
      webhookPath: path.join('/', process.env.WEBHOOK_PATH ?? 'github'),
    },
    probot: {
      appId: auth.appId,
      privateKey: auth.privateKey,
      secret: process.env.WEBHOOK_SECRET,
      logLevel: 'debug',
    },
  };
  return config;
};

function validateEnvKeys(keys: string[]) {
  keys.forEach((key) => {
    if (!process.env[key]) throw new Error(`${key} env variable must be defined`);
  });
}
