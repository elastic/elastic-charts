/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const docsDir = path.join(repoRoot, 'docs');
const storybookDir = path.join(repoRoot, 'storybook');
const docsOutDir = path.join(docsDir, 'build');
const storybookOutDir = path.join(repoRoot, '.out');
const siteOutDir = path.join(repoRoot, '.release-site');
const productionNodeOptions = [process.env.NODE_OPTIONS, '--openssl-legacy-provider'].filter(Boolean).join(' ');

function run(command, args, options = {}) {
  const cwd = options.cwd ?? repoRoot;
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...options.env },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected build output at ${path.relative(repoRoot, filePath)}`);
  }
}

console.log('Building release-ready docs');
run('yarn', ['typedoc']);
run('yarn', ['build'], {
  cwd: docsDir,
  env: {
    DOCUSAURUS_URL: 'https://elastic.github.io',
    DOCUSAURUS_BASE_URL: '/elastic-charts',
    NODE_ENV: 'production',
    NODE_OPTIONS: productionNodeOptions,
  },
});

console.log('Building release-ready Storybook');
run('yarn', ['build'], {
  cwd: storybookDir,
  env: {
    NODE_ENV: 'production',
    NODE_OPTIONS: productionNodeOptions,
  },
});

console.log('Assembling release site');
fs.rmSync(siteOutDir, { force: true, recursive: true });
fs.cpSync(docsOutDir, siteOutDir, { recursive: true });
fs.cpSync(storybookOutDir, path.join(siteOutDir, 'storybook'), { recursive: true });
fs.writeFileSync(path.join(siteOutDir, '.nojekyll'), '');

ensureFileExists(path.join(siteOutDir, 'index.html'));
ensureFileExists(path.join(siteOutDir, 'storybook', 'index.html'));

console.log(`Release site assembled at ${path.relative(repoRoot, siteOutDir)}`);
