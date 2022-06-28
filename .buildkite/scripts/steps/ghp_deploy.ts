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
  const outDir = 'storybook/.out';

  const storybookSrc = '.buildkite/artifacts/storybook.gz';
  await downloadArtifacts(storybookSrc, 'build_storybook');
  await decompress({
    src: storybookSrc,
    dest: outDir,
  });

  startGroup('Check deployment files');
  const hasStorybookIndex = fs.existsSync(path.join(outDir, 'index.html'));
  if (!hasStorybookIndex) {
    throw new Error('Error: Missing storybook deployment files');
  }

  await ghpDeploy(outDir);
})();
