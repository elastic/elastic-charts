/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { spawnSync } = require('child_process');

// one API report per entry point of the package; arguments such as `--local` apply to each
const configs = ['./api-extractor.jsonc', './api-extractor.headless.jsonc'];

for (const config of configs) {
  const { status } = spawnSync('yarn', ['api-extractor', 'run', '-c', config, '--verbose', ...process.argv.slice(2)], {
    stdio: 'inherit',
  });
  if (status !== 0) throw new Error(`API extraction failed for ${config}`);
}
