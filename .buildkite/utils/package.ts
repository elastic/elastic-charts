/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

import axios from 'axios';
import { getMetadata, setMetadata } from 'buildkite-agent-node';

import { bkEnv, downloadArtifacts, startGroup } from './buildkite';
import { MetaDataKeys } from './constants';
import { getOrCreateDeploymentUrl } from './firebase';

export const CHARTS_PACKAGE_MANIFEST_FILENAME = 'charts-package-manifest.json';
export const CHARTS_PACKAGE_RETENTION_COUNT = 3; // Rolling retention count for previous commit tarballs

export interface ChartsPackageMetadata {
  liveTarballFilename: string;
  commitTarballFilename: string;
  version: string;
  commitSha: string;
  commitShortSha: string;
}

export interface ChartsPackageManifest extends ChartsPackageMetadata {
  packageName: '@elastic/charts';
  pullRequestNumber: number;
  retainedCommitTarballFilenames: string[];
}

export interface PreparedChartsPackages {
  liveTarballDest: string;
  commitTarballDest: string;
  manifestDest: string;
}

// Persist the current package filenames and commit identity for downstream steps.
export async function setChartsPackageMetadata(metadata: ChartsPackageMetadata) {
  await Promise.all([
    setMetadata(MetaDataKeys.chartsPackageLiveTarballFilename, metadata.liveTarballFilename),
    setMetadata(MetaDataKeys.chartsPackageCommitTarballFilename, metadata.commitTarballFilename),
    setMetadata(MetaDataKeys.chartsPackageVersion, metadata.version),
    setMetadata(MetaDataKeys.chartsPackageCommitSha, metadata.commitSha),
    setMetadata(MetaDataKeys.chartsPackageCommitShortSha, metadata.commitShortSha),
  ]);
}

export async function getChartsPackageMetadata(required: true): Promise<ChartsPackageMetadata>;
export async function getChartsPackageMetadata(required?: false): Promise<ChartsPackageMetadata | null>;
export async function getChartsPackageMetadata(required: boolean = false): Promise<ChartsPackageMetadata | null> {
  const [liveTarballFilename, commitTarballFilename, version, commitSha, commitShortSha] = await Promise.all([
    getMetadata(MetaDataKeys.chartsPackageLiveTarballFilename),
    getMetadata(MetaDataKeys.chartsPackageCommitTarballFilename),
    getMetadata(MetaDataKeys.chartsPackageVersion),
    getMetadata(MetaDataKeys.chartsPackageCommitSha),
    getMetadata(MetaDataKeys.chartsPackageCommitShortSha),
  ]);

  if (!liveTarballFilename || !commitTarballFilename || !version || !commitSha || !commitShortSha) {
    if (required) {
      throw new Error('Failed to find complete charts package metadata');
    }

    return null;
  }

  return {
    liveTarballFilename,
    commitTarballFilename,
    version,
    commitSha,
    commitShortSha,
  };
}

// Serialize the deployed package state so the next deploy can rehydrate retained tarballs.
export function createChartsPackageManifest(
  metadata: ChartsPackageMetadata,
  pullRequestNumber: number,
  retainedCommitTarballFilenames: string[] = [metadata.commitTarballFilename],
): ChartsPackageManifest {
  return {
    packageName: '@elastic/charts',
    liveTarballFilename: metadata.liveTarballFilename,
    commitTarballFilename: metadata.commitTarballFilename,
    version: metadata.version,
    commitSha: metadata.commitSha,
    commitShortSha: metadata.commitShortSha,
    pullRequestNumber,
    retainedCommitTarballFilenames,
  };
}

// Derive a package file URL from the preview deployment base URL.
export function getChartsPackageUrl(deploymentUrl: string, tarballFilename: string) {
  const baseUrl = deploymentUrl.endsWith('/') ? deploymentUrl : `${deploymentUrl}/`;
  return new URL(`packages/${tarballFilename}`, baseUrl).toString();
}

export function getChartsPackageUrls(deploymentUrl: string, metadata: ChartsPackageMetadata) {
  return {
    liveTarballUrl: getChartsPackageUrl(deploymentUrl, metadata.liveTarballFilename),
    commitTarballUrl: getChartsPackageUrl(deploymentUrl, metadata.commitTarballFilename),
  };
}

// Stage the current package artifacts and restore retained commit tarballs before deploy.
export async function prepareChartsPackagesForDeployment(
  outDir: string,
  chartsPackage: ChartsPackageMetadata,
): Promise<PreparedChartsPackages> {
  startGroup('Preparing @elastic/charts deployment packages');

  const chartsPackageDestDir = path.join(outDir, 'packages');
  const liveChartsPackageSrc = path.join('.buildkite/artifacts/packages', chartsPackage.liveTarballFilename);
  const liveChartsPackageDest = path.join(chartsPackageDestDir, chartsPackage.liveTarballFilename);
  const commitChartsPackageSrc = path.join('.buildkite/artifacts/packages', chartsPackage.commitTarballFilename);
  const commitChartsPackageDest = path.join(chartsPackageDestDir, chartsPackage.commitTarballFilename);
  const manifestSrc = path.join('.buildkite/artifacts/packages', CHARTS_PACKAGE_MANIFEST_FILENAME);
  const manifestDest = path.join(chartsPackageDestDir, CHARTS_PACKAGE_MANIFEST_FILENAME);

  await downloadArtifacts(liveChartsPackageSrc, 'build_charts_package_preview');
  await downloadArtifacts(commitChartsPackageSrc, 'build_charts_package_preview');
  await downloadArtifacts(manifestSrc, 'build_charts_package_preview');

  fs.rmSync(chartsPackageDestDir, { recursive: true, force: true });
  fs.mkdirSync(chartsPackageDestDir, { recursive: true });
  fs.copyFileSync(liveChartsPackageSrc, liveChartsPackageDest);
  fs.copyFileSync(commitChartsPackageSrc, commitChartsPackageDest);

  const currentManifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf8')) as ChartsPackageManifest;
  const retainedCommitTarballFilenames = await getRetainedCommitTarballFilenames(
    chartsPackageDestDir,
    chartsPackage.commitTarballFilename,
  );

  fs.writeFileSync(
    manifestDest,
    JSON.stringify(
      createChartsPackageManifest(chartsPackage, currentManifest.pullRequestNumber, retainedCommitTarballFilenames),
      null,
      2,
    ),
  );

  return {
    liveTarballDest: liveChartsPackageDest,
    commitTarballDest: commitChartsPackageDest,
    manifestDest,
  };
}

// Keep the current tarball first, then previous retained entries in manifest order, capped to the retention limit.
async function getRetainedCommitTarballFilenames(chartsPackageDestDir: string, currentCommitTarballFilename: string) {
  if (!bkEnv.isPullRequest) {
    return [currentCommitTarballFilename];
  }

  const deploymentUrl = await getOrCreateDeploymentUrl();
  const previousManifest = await getDeployedChartsPackageManifest(deploymentUrl);
  const desiredRetainedCommitTarballFilenames = getDesiredRetainedCommitTarballFilenames(
    currentCommitTarballFilename,
    previousManifest,
  );
  const retainedCommitTarballFilenames = [currentCommitTarballFilename];

  for (const tarballFilename of desiredRetainedCommitTarballFilenames.slice(1)) {
    const tarballDest = path.join(chartsPackageDestDir, tarballFilename);
    const tarballUrl = getChartsPackageUrl(deploymentUrl, tarballFilename);
    const wasDownloaded = await downloadDeployedChartsPackageTarball(tarballUrl, tarballDest);

    if (wasDownloaded) {
      retainedCommitTarballFilenames.push(tarballFilename);
    }
  }

  console.log(`Retaining charts package tarballs: ${retainedCommitTarballFilenames.join(', ')}`);

  return retainedCommitTarballFilenames;
}

// Compute the retained list from manifest order only; it does not sort by SHA or timestamp.
function getDesiredRetainedCommitTarballFilenames(
  currentCommitTarballFilename: string,
  previousManifest: ChartsPackageManifest | null,
) {
  return [
    currentCommitTarballFilename,
    ...getPreviousRetainedCommitTarballFilenames(previousManifest).filter(
      (tarballFilename) => tarballFilename !== currentCommitTarballFilename,
    ),
  ].slice(0, CHARTS_PACKAGE_RETENTION_COUNT);
}

// Read the deployed manifest to discover which commit tarballs can be rehydrated.
async function getDeployedChartsPackageManifest(deploymentUrl: string): Promise<ChartsPackageManifest | null> {
  const manifestUrl = getChartsPackageUrl(deploymentUrl, CHARTS_PACKAGE_MANIFEST_FILENAME);

  try {
    const response = await axios.get<ChartsPackageManifest>(manifestUrl, {
      validateStatus: (status) => status === 200 || status === 404,
    });

    return response.status === 200 ? response.data : null;
  } catch (error) {
    console.warn(`Failed to fetch charts package manifest from ${manifestUrl}`);
    console.warn(error);
    return null;
  }
}

// Fall back to the single commit entry when reading manifests created before retention was added.
function getPreviousRetainedCommitTarballFilenames(previousManifest: ChartsPackageManifest | null) {
  if (!previousManifest) {
    return [];
  }

  if (previousManifest.retainedCommitTarballFilenames?.length > 0) {
    return previousManifest.retainedCommitTarballFilenames;
  }

  return [previousManifest.commitTarballFilename];
}

// Copy a retained tarball from the deployed preview so it survives the next full redeploy.
async function downloadDeployedChartsPackageTarball(url: string, dest: string) {
  try {
    const response = await axios.get<NodeJS.ReadableStream>(url, {
      responseType: 'stream',
      validateStatus: (status) => status === 200 || status === 404,
    });

    if (response.status !== 200) {
      return false;
    }

    await pipeline(response.data, fs.createWriteStream(dest));
    return true;
  } catch (error) {
    fs.rmSync(dest, { force: true });
    console.warn(`Failed to download charts package tarball from ${url}`);
    console.warn(error);
    return false;
  }
}
