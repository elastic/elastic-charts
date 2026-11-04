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
const distError = /^(dist\/|\S*packages\/charts\/dist\/)/;
const filePrefixedDiagnostic = /^\S+\(\d+,\d+\):/;
const unprefixedTsError = /^error TS\d+/;

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
if (!fs.existsSync(tsc)) {
  fail(`tsc not found at ${tsc}`);
}

try {
  execFileSync(tsc, ['-p', './tsconfig.check.json', '--pretty', 'false'], {
    cwd: chartsDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
} catch (error) {
  if (error.status === undefined || error.status === null) {
    fail(`Failed to run tsc: ${error.code ?? error.message}`);
  }

  const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  const lines = output.split('\n').filter(Boolean);
  const distErrors = lines.filter((line) => distError.test(line));
  if (distErrors.length > 0) {
    fail(distErrors.join('\n'));
  }

  const unprefixed = lines.filter((line) => unprefixedTsError.test(line));
  if (unprefixed.length > 0) {
    fail(unprefixed.join('\n'));
  }

  const filePrefixed = lines.filter((line) => filePrefixedDiagnostic.test(line));
  const unexplained = filePrefixed.filter((line) => !line.includes('node_modules'));
  if (unexplained.length > 0) {
    fail(unexplained.join('\n'));
  }
  if (filePrefixed.length === 0) {
    fail(output.trim() || `tsc exited ${error.status} with no file-prefixed diagnostics`);
  }
}
