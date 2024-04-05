/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { downloadArtifacts, startGroup, decompress, ghpDeploy } from '../../utils';

void (async () => {
  const outDir = '.out';

  const docsSrc = '.buildkite/artifacts/docs.gz';
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

  startGroup('Check deployment files');

  const hasDocsIndex = fs.existsSync('./e2e_server/public/index.html');
  const hasStorybookIndex = fs.existsSync(path.join(outDir, 'index.html'));

  const missingFiles = [
    ['docs', hasDocsIndex],
    ['storybook', hasStorybookIndex],
  ]
    .filter(([, exists]) => !exists)
    .map<string>(([f]) => f as string);

  if (missingFiles.length > 0) {
    throw new Error(`Error: Missing deployment files: [${missingFiles.join(', ')}]`);
  }

  await ghpDeploy(outDir);
})();
