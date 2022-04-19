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

void (async () => {
  const inputReportPaths = fs
    .readdirSync('./reports', { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map(({ name }) => path.resolve('reports', name));

  if (inputReportPaths.length === 0) {
    throw new Error('Error: No e2e reports found in e2e/reports/* to merge');
  }

  console.log(`Merging ${inputReportPaths.length} playwright html reports:\n\n\t${inputReportPaths.join('\n\t')}\n`);

  if (!fs.existsSync('./node_modules/@playwright/test/node_modules/playwright-core')) {
    fs.symlinkSync(
      path.resolve('./node_modules/playwright-core'),
      path.resolve('./node_modules/@playwright/test/node_modules/playwright-core'),
    );
  }

  const config = {
    outputFolderName: process.env.HTML_REPORT_DIR ?? 'merged_html_report',
    outputBasePath: path.resolve(process.cwd(), process.env.HTML_REPORT_PATH ?? ''),
  };

  await mergeHTMLReports(inputReportPaths, config);

  const files = fs.readdirSync(`${config.outputBasePath}/${config.outputFolderName}/data`);

  console.log('post merge check files');
  console.log('total files', files.length);
  console.log(files);
})();
