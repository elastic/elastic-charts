/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Directory holding the per-shard `blob` reports (`*.zip`) to merge.
const BLOB_REPORTS_DIR = process.env.BLOB_REPORTS_DIR ?? './reports/blob';

void (() => {
  const blobReportsDir = path.resolve(process.cwd(), BLOB_REPORTS_DIR);

  if (!fs.existsSync(blobReportsDir)) {
    throw new Error(`Error: blob reports directory not found at ${blobReportsDir}`);
  }

  const blobReports = fs.readdirSync(blobReportsDir).filter((name) => name.endsWith('.zip'));

  if (blobReports.length === 0) {
    throw new Error(`Error: No blob reports (*.zip) found in ${blobReportsDir} to merge`);
  }

  // eslint-disable-next-line no-console
  console.log(`Merging ${blobReports.length} playwright blob reports:\n\n\t${blobReports.join('\n\t')}\n`);

  const outputFolderName = process.env.HTML_REPORT_DIR ?? 'merged_html_report';
  const outputBasePath = path.resolve(process.cwd(), process.env.HTML_REPORT_PATH ?? '');
  const outputDir = path.join(outputBasePath, outputFolderName);

  // The html reporter honors PLAYWRIGHT_HTML_REPORT for the output directory.
  execFileSync('yarn', ['playwright', 'merge-reports', '--reporter', 'html', blobReportsDir], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_HTML_REPORT: outputDir,
      PLAYWRIGHT_HTML_OPEN: 'never',
    },
  });
})();
