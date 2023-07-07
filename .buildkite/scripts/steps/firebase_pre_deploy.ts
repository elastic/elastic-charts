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
import { createDeploymentStatus, createOrUpdateDeploymentComment } from '../../utils/deployment';

void (async () => {
  if (bkEnv.isPullRequest) {
    await createOrUpdateDeploymentComment({
      state: 'pending',
      preDeploy: true,
    });
  } else {
    await createDeploymentStatus({ state: 'in_progress' });
  }

  const outDir = 'e2e_server/public';

  const storybookSrc = '.buildkite/artifacts/storybook.gz';
  await downloadArtifacts(storybookSrc, 'build_storybook');
  await decompress({
    src: storybookSrc,
    dest: outDir,
  });

  const e2eSrc = '.buildkite/artifacts/e2e_server.gz';
  await downloadArtifacts(e2eSrc, 'build_e2e');
  await decompress({
    src: e2eSrc,
    dest: path.join(outDir, 'e2e'),
  });

  startGroup('Check deployment files');

  const hasStorybookIndex = fs.existsSync('./e2e_server/public/index.html');
  const hasE2EIndex = fs.existsSync('./e2e_server/public/e2e/index.html');
  const missingFiles = [
    ['storybook', hasStorybookIndex],
    ['e2e server', hasE2EIndex],
  ]
    .filter(([, exists]) => !exists)
    .map<string>(([f]) => f as string);

  if (missingFiles.length > 0) {
    throw new Error(`Error: Missing deployment files: [${missingFiles.join(', ')}]`);
  }

  // Move 404 file to /e2e-report
  fs.renameSync('../../assets/404-report.html', './e2e_server/public/e2e-report/index.html');

  await firebaseDeploy({
    preDeploy: true,
  });
})();
