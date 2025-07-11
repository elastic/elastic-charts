/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { firebaseDeploy, downloadArtifacts, startGroup, decompress, bkEnv } from '../../utils';
import { createDeploymentStatus } from '../../utils/deployment';

void (async () => {
  if (!bkEnv.isPullRequest) {
    await createDeploymentStatus({ state: 'in_progress' });
  }

  const outDir = 'e2e_server/public';

  const docsSrc = '.buildkite/artifacts/docs/firebase.gz';
  await downloadArtifacts(docsSrc, 'build_docs');
  await decompress({
    src: docsSrc,
    dest: outDir,
  });

  const storybookSrc = '.buildkite/artifacts/storybook.gz';
  await downloadArtifacts(storybookSrc, 'build_storybook');
  await decompress({
    src: storybookSrc,
    dest: path.join(outDir, 'storybook'),
  });

  const e2eSrc = '.buildkite/artifacts/e2e_server.gz';
  await downloadArtifacts(e2eSrc, 'build_e2e');
  await decompress({
    src: e2eSrc,
    dest: path.join(outDir, 'e2e'),
  });

  const e2eReportSrc = '.buildkite/artifacts/merged_html_report.gz';
  await downloadArtifacts(e2eReportSrc, 'playwright_merge_and_status');
  await decompress({
    src: e2eReportSrc,
    dest: path.join(outDir, 'e2e-report'),
  });

  const a11yReportSrc = '.buildkite/artifacts/merged_a11y_html_report.gz';
  await downloadArtifacts(a11yReportSrc, 'playwright_a11y_merge_and_status');
  await decompress({
    src: a11yReportSrc,
    dest: path.join(outDir, 'a11y-report'),
  });

  startGroup('Check deployment files');

  const hasDocsIndex = fs.existsSync(path.join(outDir, 'index.html'));
  const hasStorybookIndex = fs.existsSync(path.join(outDir, 'storybook/index.html'));
  const hasE2EIndex = fs.existsSync(path.join(outDir, 'e2e/index.html'));
  const hasE2EReportIndex = fs.existsSync(path.join(outDir, 'e2e-report/index.html'));
  const hasA11yReportIndex = fs.existsSync(path.join(outDir, 'a11y-report/index.html'));
  const missingFiles = [
    ['docs', hasDocsIndex],
    ['storybook', hasStorybookIndex],
    ['e2e server', hasE2EIndex],
    ['e2e report', hasE2EReportIndex],
    ['a11y report', hasA11yReportIndex],
  ]
    .filter(([, exists]) => !exists)
    .map<string>(([f]) => f as string);

  if (missingFiles.length > 0) {
    throw new Error(`Error: Missing deployment files: [${missingFiles.join(', ')}]`);
  }

  await firebaseDeploy();
})();
