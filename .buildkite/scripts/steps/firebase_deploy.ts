/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { createDeploymentStatus, firebaseDeploy, downloadArtifacts, startGroup, decompress } from '../../utils';

void (async () => {
  await createDeploymentStatus({ state: 'in_progress' });

  const outDir = 'e2e-server/public';

  const storybookSrc = '.buildkite/artifacts/storybook.gz';
  downloadArtifacts(storybookSrc, 'storybook', undefined, '61442a8d-3283-422e-a42c-c3fc232ddbde');
  await decompress({
    src: storybookSrc,
    dest: outDir,
  });

  const e2eSrc = '.buildkite/artifacts/e2e_server.gz';
  downloadArtifacts(e2eSrc, 'e2e_server', undefined, '61442a8d-3283-422e-a42c-c3fc232ddbde');
  await decompress({
    src: e2eSrc,
    dest: path.join(outDir, 'e2e'),
  });

  const e2eReportSrc = '.buildkite/artifacts/merged_html_report.gz';
  downloadArtifacts(e2eReportSrc, 'playwright-merge-and-status', undefined, '61442a8d-3283-422e-a42c-c3fc232ddbde');
  await decompress({
    src: e2eReportSrc,
    dest: path.join(outDir, 'e2e-report'),
  });

  startGroup('Check deployment files');
  const hasStorybookIndex = fs.existsSync('./e2e-server/public/index.html');
  const hasE2EIndex = fs.existsSync('./e2e-server/public/e2e/index.html');
  const hasE2EReportIndex = fs.existsSync('./e2e-server/public/e2e-report/index.html');
  const missingFiles = [
    ['storybook', hasStorybookIndex],
    ['e2e server', hasE2EIndex],
    ['e2e report', hasE2EReportIndex],
  ]
    .filter(([, exists]) => !exists)
    .map<string>(([f]) => f as string);

  if (missingFiles.length > 0) {
    throw new Error(`Error: Missing deployment files: [${missingFiles.join(', ')}]`);
  }

  await firebaseDeploy();
})();
