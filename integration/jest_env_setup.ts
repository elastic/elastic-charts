/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

const customConfig = { threshold: 0 };
export const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: customConfig,
  failureThreshold: 0,
  failureThresholdType: 'percent',
});

expect.extend({ toMatchImageSnapshot });

jest.setTimeout(process.env.DEBUG ? 10 * 10 * 1000 : 10 * 1000); // set timeout in milliseconds;
