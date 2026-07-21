/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';

import { assembleSite, buildDocsSite, buildStorybookSite, buildTypeDocs } from '../utils/site';

const releaseSiteDir = path.resolve(__dirname, '../../.release-site');

/**
 * Builds the release-ready static site consumed by the GitHub release workflow.
 * The assembled output matches the published GitHub Pages layout with docs at
 * the root and Storybook under `/storybook`.
 */
console.log('Building release-ready docs');
buildTypeDocs();
buildDocsSite({
  docsUrl: 'https://elastic.github.io',
  baseUrl: '/elastic-charts',
  nodeEnv: 'production',
});

console.log('Building release-ready Storybook');
buildStorybookSite({
  nodeEnv: 'production',
});

console.log('Assembling release site');
assembleSite({
  outDir: releaseSiteDir,
});

console.log(`Release site assembled at ${path.relative(path.resolve(__dirname, '../..'), releaseSiteDir)}`);
