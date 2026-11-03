/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chartsDir = path.resolve(__dirname, '..');
const esmTypes = path.join(chartsDir, 'dist/esm/index.d.mts');
const cjsTypes = path.join(chartsDir, 'dist/cjs/index.d.ts');

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(esmTypes)) {
  fail('Missing dist/esm/index.d.mts. Run `yarn build:compile` first.');
}
if (!fs.existsSync(cjsTypes)) {
  fail('Missing dist/cjs/index.d.ts. Run `yarn build:compile` first.');
}

const tsc = path.join(chartsDir, '../../node_modules/.bin/tsc');
let output = '';
try {
  execFileSync(tsc, ['-p', './tsconfig.check.json', '--pretty', 'false'], {
    cwd: chartsDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
} catch (error) {
  output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
}

const distErrors = output.split('\n').filter((line) => /^(dist\/|\S*packages\/charts\/dist\/)/.test(line));
if (distErrors.length > 0) {
  fail(distErrors.join('\n'));
}
