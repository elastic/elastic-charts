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

interface ChartsPackageEntry {
  tarballFilename: string;
  builtAt?: string;
  commitShortSha?: string;
  version?: string;
}

export interface ChartsPackageManifest extends ChartsPackageMetadata {
  packageName: '@elastic/charts';
  pullRequestNumber: number;
  retainedCommitTarballFilenames: string[];
  retainedCommitPackages: ChartsPackageEntry[];
}

export interface PreparedChartsPackages {
  liveTarballDest: string;
  commitTarballDest: string;
  manifestDest: string;
  indexDest: string;
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
      console.error('Failed to find complete charts package metadata', {
        liveTarballFilename,
        commitTarballFilename,
        version,
        commitSha,
        commitShortSha,
      });
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
  retainedCommitPackages: ChartsPackageEntry[] = [createChartsPackageEntry(metadata)],
): ChartsPackageManifest {
  return {
    packageName: '@elastic/charts',
    liveTarballFilename: metadata.liveTarballFilename,
    commitTarballFilename: metadata.commitTarballFilename,
    version: metadata.version,
    commitSha: metadata.commitSha,
    commitShortSha: metadata.commitShortSha,
    pullRequestNumber,
    retainedCommitTarballFilenames: retainedCommitPackages.map(({ tarballFilename }) => tarballFilename),
    retainedCommitPackages,
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

export function getChartsPackagesUrl(deploymentUrl: string) {
  const baseUrl = deploymentUrl.endsWith('/') ? deploymentUrl : `${deploymentUrl}/`;
  return new URL('packages/', baseUrl).toString();
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
  const indexDest = path.join(chartsPackageDestDir, 'index.html');

  await downloadArtifacts(liveChartsPackageSrc, 'build_charts_package_preview');
  await downloadArtifacts(commitChartsPackageSrc, 'build_charts_package_preview');
  await downloadArtifacts(manifestSrc, 'build_charts_package_preview');

  fs.rmSync(chartsPackageDestDir, { recursive: true, force: true });
  fs.mkdirSync(chartsPackageDestDir, { recursive: true });
  fs.copyFileSync(liveChartsPackageSrc, liveChartsPackageDest);
  fs.copyFileSync(commitChartsPackageSrc, commitChartsPackageDest);

  const currentManifest = JSON.parse(fs.readFileSync(manifestSrc, 'utf8')) as ChartsPackageManifest;
  const currentCommitPackage = currentManifest.retainedCommitPackages[0] ?? createChartsPackageEntry(chartsPackage);
  const retainedCommitPackages = await getRetainedCommitPackages(chartsPackageDestDir, currentCommitPackage);

  fs.writeFileSync(
    manifestDest,
    JSON.stringify(
      createChartsPackageManifest(chartsPackage, currentManifest.pullRequestNumber, retainedCommitPackages),
      null,
      2,
    ),
  );
  fs.writeFileSync(
    indexDest,
    renderChartsPackagesIndex(chartsPackage, currentManifest.pullRequestNumber, retainedCommitPackages),
  );

  return {
    liveTarballDest: liveChartsPackageDest,
    commitTarballDest: commitChartsPackageDest,
    manifestDest,
    indexDest,
  };
}

// Keep the current tarball first, then previous retained entries in manifest order, capped to the retention limit.
async function getRetainedCommitPackages(chartsPackageDestDir: string, currentCommitPackage: ChartsPackageEntry) {
  if (!bkEnv.isPullRequest) {
    return [currentCommitPackage];
  }

  const deploymentUrl = await getOrCreateDeploymentUrl();
  const previousManifest = await getDeployedChartsPackageManifest(deploymentUrl);
  const desiredRetainedCommitPackages = getDesiredRetainedCommitPackages(currentCommitPackage, previousManifest);
  const retainedCommitPackages = [currentCommitPackage];

  for (const retainedCommitPackage of desiredRetainedCommitPackages.slice(1)) {
    const tarballDest = path.join(chartsPackageDestDir, retainedCommitPackage.tarballFilename);
    const tarballUrl = getChartsPackageUrl(deploymentUrl, retainedCommitPackage.tarballFilename);
    const downloadedCommitPackage = await downloadDeployedChartsPackageTarball(tarballUrl, tarballDest);

    if (downloadedCommitPackage) {
      retainedCommitPackages.push({
        ...retainedCommitPackage,
        builtAt: retainedCommitPackage.builtAt ?? downloadedCommitPackage.builtAt ?? getFileBuiltAt(tarballDest),
      });
    }
  }

  console.log(
    `Retaining charts package tarballs: ${retainedCommitPackages.map(({ tarballFilename }) => tarballFilename).join(', ')}`,
  );

  return retainedCommitPackages;
}

// Compute the retained list from manifest order only; it does not sort by SHA or timestamp.
function getDesiredRetainedCommitPackages(
  currentCommitPackage: ChartsPackageEntry,
  previousManifest: ChartsPackageManifest | null,
) {
  return [
    currentCommitPackage,
    ...(previousManifest?.retainedCommitPackages ?? []).filter(
      ({ tarballFilename }) => tarballFilename !== currentCommitPackage.tarballFilename,
    ),
  ].slice(0, CHARTS_PACKAGE_RETENTION_COUNT);
}

// Read the deployed manifest to discover which commit tarballs can be rehydrated.
async function getDeployedChartsPackageManifest(deploymentUrl: string): Promise<ChartsPackageManifest | null> {
  const manifestUrl = getChartsPackageUrl(deploymentUrl, CHARTS_PACKAGE_MANIFEST_FILENAME);

  try {
    const response = await axios.get<unknown>(manifestUrl, {
      validateStatus: (status) => status === 200 || status === 404,
    });

    if (response.status !== 200) {
      return null;
    }

    const manifest = validateChartsPackageManifest(response.data);
    if (!manifest) {
      console.warn(`Ignoring invalid charts package manifest from ${manifestUrl}`);
    }
    return manifest;
  } catch (error) {
    console.warn(`Failed to fetch charts package manifest from ${manifestUrl}`);
    console.warn(error);
    return null;
  }
}

// Validate the required manifest fields and default optional retained filenames when omitted.
function validateChartsPackageManifest(value: unknown): ChartsPackageManifest | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const manifest = value as Partial<ChartsPackageManifest>;
  if (
    manifest.packageName !== '@elastic/charts' ||
    typeof manifest.liveTarballFilename !== 'string' ||
    typeof manifest.commitTarballFilename !== 'string' ||
    typeof manifest.version !== 'string' ||
    typeof manifest.commitSha !== 'string' ||
    typeof manifest.commitShortSha !== 'string' ||
    typeof manifest.pullRequestNumber !== 'number'
  ) {
    return null;
  }

  const retainedCommitPackages = Array.isArray(manifest.retainedCommitPackages)
    ? manifest.retainedCommitPackages
        .map(validateChartsPackageEntry)
        .filter((retainedCommitPackage): retainedCommitPackage is ChartsPackageEntry => retainedCommitPackage !== null)
    : [];

  const retainedCommitTarballFilenames = Array.isArray(manifest.retainedCommitTarballFilenames)
    ? manifest.retainedCommitTarballFilenames.filter(
        (tarballFilename): tarballFilename is string => typeof tarballFilename === 'string',
      )
    : [];

  const normalizedRetainedCommitPackages =
    retainedCommitPackages.length > 0
      ? retainedCommitPackages
      : retainedCommitTarballFilenames.map((tarballFilename) =>
          createChartsPackageEntryFromTarballFilename(tarballFilename),
        );

  return {
    packageName: manifest.packageName,
    liveTarballFilename: manifest.liveTarballFilename,
    commitTarballFilename: manifest.commitTarballFilename,
    version: manifest.version,
    commitSha: manifest.commitSha,
    commitShortSha: manifest.commitShortSha,
    pullRequestNumber: manifest.pullRequestNumber,
    retainedCommitTarballFilenames:
      normalizedRetainedCommitPackages.length > 0
        ? normalizedRetainedCommitPackages.map(({ tarballFilename }) => tarballFilename)
        : [manifest.commitTarballFilename],
    retainedCommitPackages:
      normalizedRetainedCommitPackages.length > 0
        ? normalizedRetainedCommitPackages
        : [createChartsPackageEntryFromTarballFilename(manifest.commitTarballFilename, manifest.commitShortSha)],
  };
}

function validateChartsPackageEntry(value: unknown): ChartsPackageEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const packageEntry = value as Partial<ChartsPackageEntry>;
  if (typeof packageEntry.tarballFilename !== 'string') {
    return null;
  }

  return createChartsPackageEntryFromTarballFilename(
    packageEntry.tarballFilename,
    typeof packageEntry.commitShortSha === 'string' ? packageEntry.commitShortSha : undefined,
    typeof packageEntry.builtAt === 'string' ? packageEntry.builtAt : undefined,
    typeof packageEntry.version === 'string' ? packageEntry.version : undefined,
  );
}

function createChartsPackageEntry(
  chartsPackage: ChartsPackageMetadata,
  builtAt: string = new Date().toISOString(),
): ChartsPackageEntry {
  return {
    tarballFilename: chartsPackage.commitTarballFilename,
    builtAt,
    commitShortSha: chartsPackage.commitShortSha,
    version: chartsPackage.version,
  };
}

function createChartsPackageEntryFromTarballFilename(
  tarballFilename: string,
  commitShortSha: string | undefined = getCommitShortShaFromTarballFilename(tarballFilename),
  builtAt?: string,
  version: string | undefined = getVersionFromTarballFilename(tarballFilename),
): ChartsPackageEntry {
  return {
    tarballFilename,
    builtAt,
    commitShortSha,
    version,
  };
}

function getCommitShortShaFromTarballFilename(tarballFilename: string) {
  const commitShortShaMatch = tarballFilename.match(/-([\da-f]{7,})\.tgz$/i);
  return commitShortShaMatch?.[1];
}

function getVersionFromTarballFilename(tarballFilename: string) {
  const versionMatch = tarballFilename.match(/-v(.+?)-pr-\d+(?:-[\da-f]{7,})?\.tgz$/i);
  return versionMatch?.[1];
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
    return {
      builtAt: getBuiltAtFromLastModifiedHeader(response.headers['last-modified']),
    };
  } catch (error) {
    fs.rmSync(dest, { force: true });
    console.warn(`Failed to download charts package tarball from ${url}`);
    console.warn(error);
    return false;
  }
}

function getBuiltAtFromLastModifiedHeader(lastModified?: string) {
  if (!lastModified) {
    return undefined;
  }

  const builtAt = new Date(lastModified);
  return Number.isNaN(builtAt.valueOf()) ? undefined : builtAt.toISOString();
}

function getFileBuiltAt(filePath: string) {
  const stats = fs.statSync(filePath);
  return stats.birthtime.toISOString();
}

function renderChartsPackagesIndex(
  chartsPackage: ChartsPackageMetadata,
  pullRequestNumber: number,
  retainedCommitPackages: ChartsPackageEntry[],
) {
  const currentCommitPackage = retainedCommitPackages[0] ?? createChartsPackageEntry(chartsPackage);
  const previousCommitPackages = retainedCommitPackages.slice(1);
  const pullRequestUrl = `https://github.com/elastic/elastic-charts/pull/${pullRequestNumber}`;
  const packageManifestHref = `./${CHARTS_PACKAGE_MANIFEST_FILENAME}`;
  const packageRows = [
    {
      href: `./${chartsPackage.liveTarballFilename}`,
      label: 'pr.tgz',
      title: chartsPackage.liveTarballFilename,
      commit: 'latest',
      version: currentCommitPackage.version ?? chartsPackage.version,
      builtAt: currentCommitPackage.builtAt,
    },
    {
      href: `./${chartsPackage.commitTarballFilename}`,
      label: `${chartsPackage.commitShortSha}.tgz`,
      title: chartsPackage.commitTarballFilename,
      commit: `${chartsPackage.commitShortSha} (latest)`,
      version: currentCommitPackage.version ?? chartsPackage.version,
      builtAt: currentCommitPackage.builtAt,
    },
    ...previousCommitPackages.map(({ tarballFilename, commitShortSha, version, builtAt }) => ({
      href: `./${tarballFilename}`,
      label: commitShortSha ? `${commitShortSha}.tgz` : tarballFilename,
      title: tarballFilename,
      commit: commitShortSha ?? 'Unavailable',
      version: version ?? getVersionFromTarballFilename(tarballFilename) ?? 'Unavailable',
      builtAt,
    })),
  ]
    .map(renderChartsPackageRow)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>@elastic/charts preview packages</title>
    <style>
      th, td {
        border: 1px solid #9ca3af;
        padding: 8px;
      }
    </style>
  </head>
  <body style="font-family: monospace; line-height: 1.5; margin: 24px;">
    <header>
      <h1>@elastic/charts <a href="${pullRequestUrl}">PR #${pullRequestNumber}</a> preview packages</h1>
    </header>
    <main>
      <p>
        <strong>Disclaimer:</strong> These packages are for development and validation purposes only, and file names and embedded package versions are not representative of release or prerelease builds.
      </p>
      <section aria-labelledby="packages-heading">
        <h2 id="packages-heading">Packages</h2>
        <p>
          Use <a href="./${chartsPackage.liveTarballFilename}">pr.tgz</a> to follow the latest successful build in this pull request, use commit-specific tarballs when you need a fixed package that will not update with later commits, and inspect
          <a href="${packageManifestHref}">${CHARTS_PACKAGE_MANIFEST_FILENAME}</a> for the deployed manifest.
        </p>
        <table style="border-collapse: collapse; margin-top: 12px;">
          <thead>
            <tr>
              <th scope="col">Package</th>
              <th scope="col">Commit</th>
              <th scope="col">Version</th>
              <th scope="col">Built</th>
            </tr>
          </thead>
          <tbody>
${packageRows}
          </tbody>
        </table>
      </section>
    </main>
  </body>
</html>
`;
}

function renderBuiltAt(builtAt?: string) {
  if (!builtAt) {
    return 'Unavailable';
  }

  return `<time datetime="${escapeHtml(builtAt)}">${escapeHtml(new Date(builtAt).toUTCString())}</time>`;
}

function renderChartsPackageRow({
  href,
  label,
  title,
  commit,
  version,
  builtAt,
}: {
  href: string;
  label: string;
  title: string;
  commit: string;
  version: string;
  builtAt?: string;
}) {
  return `            <tr>
              <td><a href="${escapeHtml(href)}" title="${escapeHtml(title)}">${escapeHtml(label)}</a></td>
              <td>${renderCodeValue(commit)}</td>
              <td>${renderCodeValue(version)}</td>
              <td>${renderBuiltAt(builtAt)}</td>
            </tr>`;
}

function renderCodeValue(value: string) {
  return value === 'Unavailable' ? value : `<code>${escapeHtml(value)}</code>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
