/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { ECH_CHECK_ID } from '../constants';

const DOCKER_VERSION = '5.12.0';

// TODO make this more safe if version is range
export const NODE_VERSION = fs.readFileSync(path.resolve(__dirname, '../../../.nvmrc')).toString().trim();
if (!NODE_VERSION) throw new Error('Error: Unable to find node verion from .nvmrc');

// e.g. '└─ @playwright/test@1.18.1'
const yarnListPlaywright = execSync('yarn list --pattern "@playwright/test" --depth=0 | grep playwright/test', {
  cwd: path.resolve(__dirname, '../../../e2e'),
})
  .toString()
  .trim();

export const PLAYWRIGHT_TEST_VERSION = (/@playwright\/test@(.+)$/.exec(yarnListPlaywright) ?? [null, null])[1];

if (!PLAYWRIGHT_TEST_VERSION) throw new Error('Error: Unable to find version of @playwright/test');

const environment = [
  'GITHUB_AUTH',
  'BUILDKITE_TOKEN',
  'FIREBASE_AUTH',
  ECH_CHECK_ID,
  'GITHUB_PR_MAINTAINER_CAN_MODIFY',
  'ECH_STEP_PLAYWRIGHT_UPDATE_SCREENSHOTS',
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
        image: `mcr.microsoft.com/playwright:v${PLAYWRIGHT_TEST_VERSION}-focal`,
        workdir: '/app',
        'propagate-environment': true,
        environment: [...environment, ...env],
        // ipc: 'host', // recommended by playwright, see https://playwright.dev/docs/docker#end-to-end-tests
      },
    }),
  };
}
