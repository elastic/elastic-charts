/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const fs = require('fs');
const path = require('path');

const ts = require('typescript');

const chartsDir = path.resolve(__dirname, '..');
const esmTypes = path.join(chartsDir, 'dist/esm/index.d.mts');
const cjsTypes = path.join(chartsDir, 'dist/cjs/index.d.ts');
const configPath = path.join(chartsDir, 'tsconfig.check.json');

const formatHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => chartsDir,
  getNewLine: () => '\n',
};

function fail(message) {
  throw new Error(message);
}

function formatDiagnostic(diagnostic) {
  return ts.formatDiagnostic(diagnostic, formatHost).trim();
}

function isNodeModulesFile(fileName) {
  return fileName.replaceAll('\\', '/').split('/').includes('node_modules');
}

function sameFile(left, right) {
  return path.resolve(left) === path.resolve(right);
}

if (!fs.existsSync(esmTypes)) {
  fail('Missing dist/esm/index.d.mts. Run `yarn build:compile` first.');
}
if (!fs.existsSync(cjsTypes)) {
  fail('Missing dist/cjs/index.d.ts. Run `yarn build:compile` first.');
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  fail(formatDiagnostic(configFile.error));
}

const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, chartsDir, undefined, configPath);
if (parsed.errors.length > 0) {
  fail(parsed.errors.map(formatDiagnostic).join('\n'));
}

if (!parsed.fileNames.some((fileName) => sameFile(fileName, esmTypes))) {
  fail('tsconfig.check.json must include dist/esm/index.d.mts');
}
if (!parsed.fileNames.some((fileName) => sameFile(fileName, cjsTypes))) {
  fail('tsconfig.check.json must include dist/cjs/index.d.ts');
}

const program = ts.createProgram({
  rootNames: parsed.fileNames,
  options: parsed.options,
});
const diagnostics = ts.getPreEmitDiagnostics(program);
const distDir = path.resolve(path.join(chartsDir, 'dist')) + path.sep;

const distErrors = [];
const otherErrors = [];
let dependencyErrorCount = 0;

diagnostics.forEach((diagnostic) => {
  const formatted = formatDiagnostic(diagnostic);
  const fileName = diagnostic.file?.fileName;
  if (!fileName) {
    otherErrors.push(formatted);
    return;
  }
  if (isNodeModulesFile(fileName)) {
    dependencyErrorCount += 1;
    return;
  }
  if (path.resolve(fileName).startsWith(distDir)) {
    distErrors.push(formatted);
    return;
  }
  otherErrors.push(formatted);
});

if (dependencyErrorCount > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `Ignored ${dependencyErrorCount} TypeScript diagnostic(s) from node_modules (workspace @types conflicts).`,
  );
}

if (distErrors.length > 0) {
  fail(distErrors.join('\n'));
}
if (otherErrors.length > 0) {
  fail(otherErrors.join('\n'));
}
