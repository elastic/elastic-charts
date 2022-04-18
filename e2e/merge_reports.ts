/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { mergeHTMLReports } from 'playwright-merge-html-reports';

const inputReportPaths = fs
  .readdirSync('./reports', { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map(({ name }) => path.resolve('reports', name));

if (!fs.existsSync('./node_modules/@playwright/test/node_modules/playwright-core')) {
  fs.symlinkSync(
    path.resolve('./node_modules/playwright-core'),
    path.resolve('./node_modules/@playwright/test/node_modules/playwright-core'),
  );
}

const config = {
  outputFolderName: 'merged_html_report',
  outputBasePath: process.cwd(),
};

void mergeHTMLReports(inputReportPaths, config);
