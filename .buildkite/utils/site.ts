/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');
const docsDir = path.join(repoRoot, 'docs');
const storybookDir = path.join(repoRoot, 'storybook');

export const docsOutDir = path.join(docsDir, 'build');
export const storybookOutDir = path.join(repoRoot, '.out');

interface CommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

interface DocsBuildOptions {
  docsUrl: string;
  nodeEnv: 'production' | 'development';
  baseUrl?: string;
}

interface StorybookBuildOptions {
  nodeEnv: 'production' | 'development';
}

interface AssembleSiteOptions {
  outDir: string;
  docsSourceDir?: string;
  storybookSourceDir?: string;
}

/**
 * Generates the TypeDoc content consumed by the Docusaurus docs build.
 */
export function buildTypeDocs() {
  run('yarn', ['typedoc']);
}

/**
 * Builds the Docusaurus site for a specific public base URL.
 */
export function buildDocsSite({ docsUrl, nodeEnv, baseUrl }: DocsBuildOptions) {
  run('yarn', ['build'], {
    cwd: docsDir,
    env: {
      DOCUSAURUS_URL: docsUrl,
      ...(baseUrl ? { DOCUSAURUS_BASE_URL: baseUrl } : {}),
      NODE_ENV: nodeEnv,
      NODE_OPTIONS: toNodeOptions(),
    },
  });
}

/**
 * Builds the static Storybook bundle used by preview and release publishing flows.
 */
export function buildStorybookSite({ nodeEnv }: StorybookBuildOptions) {
  run('yarn', ['build'], {
    cwd: storybookDir,
    env: {
      NODE_ENV: nodeEnv,
      NODE_OPTIONS: toNodeOptions(),
    },
  });
}

/**
 * Assembles the final static site tree with docs at the root and Storybook under `/storybook`.
 */
export function assembleSite({
  outDir,
  docsSourceDir = docsOutDir,
  storybookSourceDir = storybookOutDir,
}: AssembleSiteOptions) {
  fs.rmSync(outDir, { force: true, recursive: true });
  fs.cpSync(docsSourceDir, outDir, { recursive: true });
  fs.cpSync(storybookSourceDir, path.join(outDir, 'storybook'), { recursive: true });
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

  ensureFileExists(path.join(outDir, 'index.html'));
  ensureFileExists(path.join(outDir, 'storybook', 'index.html'));
}

function ensureFileExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected build output at ${path.relative(repoRoot, filePath)}`);
  }
}

function run(command: string, args: string[], { cwd = repoRoot, env = {} }: CommandOptions = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function toNodeOptions() {
  return [process.env.NODE_OPTIONS, '--openssl-legacy-provider'].filter(Boolean).join(' ');
}
