/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { bkEnv, exec, setChartsPackageMetadata, startGroup, uploadArtifacts, yarnInstall } from '../../utils';

interface NpmPackResult {
  filename: string;
  version: string;
}

void (async () => {
  const prNumber = bkEnv.pullRequestNumber;
  const commitSha = bkEnv.commit;

  if (!prNumber || !commitSha) {
    throw new Error('Charts package tarballs are only published for pull request builds with a commit SHA');
  }

  await yarnInstall();

  startGroup('Preparing @elastic/charts package files');
  await exec('node ./packages/charts/scripts/move_txt_files.js');

  startGroup('Building @elastic/charts package');
  await exec('yarn build', {
    cwd: 'packages/charts',
  });

  startGroup('Packing @elastic/charts package');
  const packOutput = await exec('npm pack --json', {
    cwd: 'packages/charts',
    stdio: 'pipe',
  });
  const [packResult] = JSON.parse(packOutput) as NpmPackResult[];

  if (!packResult?.filename || !packResult.version) {
    throw new Error('Failed to parse npm pack output for @elastic/charts');
  }

  const tarballFilename = `elastic-charts-v${packResult.version}-pr-${prNumber}.tgz`;
  const artifactDir = '.buildkite/artifacts/packages';
  const packagedTarballPath = path.join('packages/charts', packResult.filename);
  const artifactTarballPath = path.join(artifactDir, tarballFilename);
  const manifestPath = path.join(artifactDir, 'charts-package-manifest.json');
  const commitShortSha = commitSha.slice(0, 7);

  fs.mkdirSync(artifactDir, { recursive: true });
  fs.rmSync(artifactTarballPath, { force: true });
  fs.rmSync(manifestPath, { force: true });
  fs.renameSync(packagedTarballPath, artifactTarballPath);

  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        packageName: '@elastic/charts',
        tarballFilename,
        version: packResult.version,
        commitSha,
        commitShortSha,
        pullRequestNumber: prNumber,
      },
      null,
      2,
    ),
  );

  await setChartsPackageMetadata({
    tarballFilename,
    version: packResult.version,
    commitSha,
    commitShortSha,
  });

  await uploadArtifacts(artifactTarballPath);
  await uploadArtifacts(manifestPath);
})();
