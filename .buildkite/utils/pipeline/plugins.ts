/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { ECH_CHECK_ID } from '../constants';

const DOCKER_VERSION = '3.12.0';

// TODO make this more safe if version is range
export const NODE_VERSION = fs.readFileSync(path.resolve(__dirname, '../../../.nvmrc')).toString().trim();
if (!NODE_VERSION) throw new Error('Error: Unable to find node verion from .nvmrc');

// Read from the lockfile because e2e dependencies are not installed when the pipeline is generated.
// The last yaml document of pnpm-lock.yaml holds the project importers, e.g.
//   e2e:
//     dependencies:
//       '@playwright/test':
//         specifier: ^1.63.0
//         version: 1.63.0
const lockfile = fs.readFileSync(path.resolve(__dirname, '../../../pnpm-lock.yaml')).toString();
const e2eImporter = /\n {2}e2e:\n((?: {4}.*\n)+)/.exec(lockfile.slice(lockfile.lastIndexOf('\nimporters:')))?.[1] ?? '';

export const PLAYWRIGHT_TEST_VERSION =
  /'@playwright\/test':\n\s+specifier: .+\n\s+version: ([^\s(]+)/.exec(e2eImporter)?.[1] ?? null;

if (!PLAYWRIGHT_TEST_VERSION) throw new Error('Error: Unable to find version of @playwright/test');

const environment = [
  'GITHUB_AUTH',
  'BUILDKITE_TOKEN',
  'FIREBASE_AUTH',
  ECH_CHECK_ID,
  'GITHUB_PR_MAINTAINER_CAN_MODIFY',
  'ECH_STEP_PLAYWRIGHT_UPDATE_SCREENSHOTS',
  'COREPACK_ENABLE_DOWNLOAD_PROMPT=0',
];

export class Plugins {
  static docker = {
    node: (env: string[] = [], version = NODE_VERSION) => ({
      [`docker#v${DOCKER_VERSION}`]: {
        image: `node:${version}`,
        workdir: '/app',
        'propagate-environment': true,
        environment: [...environment, ...env],
      },
    }),
    playwright: (env: string[] = []) => ({
      [`docker#v${DOCKER_VERSION}`]: {
        image: `mcr.microsoft.com/playwright:v${PLAYWRIGHT_TEST_VERSION}-noble`,
        workdir: '/app',
        'propagate-environment': true,
        environment: [...environment, ...env],
        // ipc: 'host', // recommended by playwright, see https://playwright.dev/docs/docker#end-to-end-tests
      },
    }),
  };
}
