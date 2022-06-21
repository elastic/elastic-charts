/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { InstallationAccessTokenAuthentication, InstallationAuthOptions } from '@octokit/auth-app';

import {
  bkEnv,
  exec,
  downloadArtifacts,
  getJobSteps,
  startGroup,
  yarnInstall,
  compress,
  decompress,
  octokit,
  ScreenshotMeta,
  updateCheckStatus,
} from '../../utils';

async function setGroupStatus() {
  const { checkId, stepKey } = bkEnv;

  if (!checkId) {
    console.warn('Error: no checkId found, skipping e2e group status');
    return;
  }

  if (!stepKey) {
    console.warn('Error: no stepKey found, skipping e2e group status');
    return;
  }

  const e2eSteps = await getJobSteps(stepKey);

  console.log('e2eSteps');
  console.log(e2eSteps);

  const failedSteps = e2eSteps.filter((s) => !s.passed);
  const description =
    failedSteps.length > 0
      ? `Failure in ${failedSteps.length} of ${e2eSteps.length} jobs`
      : `Successful in all ${e2eSteps.length} jobs`;

  await updateCheckStatus(
    {
      status: 'completed',
      conclusion: failedSteps.length > 0 ? 'failure' : 'success',
      details_url: failedSteps.length === 1 ? failedSteps[0].url ?? bkEnv.buildUrl : bkEnv.buildUrl, // could set this to e2e-report
    },
    checkId,
    description,
  );
}

async function commitNewScreenshots() {
  startGroup('Committing updated screenshots from e2e jobs');
  await downloadArtifacts('.buildkite/artifacts/screenshot_meta/*', 'playwright__parallel-step');

  const screenshotMetaDir = '.buildkite/artifacts/screenshot_meta';
  const metaFiles = fs.readdirSync(screenshotMetaDir);
  const updatedFilePaths = metaFiles.sort().flatMap((f) => {
    const meta = JSON.parse(fs.readFileSync(path.join(screenshotMetaDir, f)).toString()) as ScreenshotMeta;
    return meta.files;
  }, 0);

  if (updatedFilePaths.length === 0) {
    console.log('No screenshots to be updated');
    return;
  }

  console.log(`Updating ${updatedFilePaths.length} screenshot${updatedFilePaths.length === 1 ? '' : 's'}:
  - ${updatedFilePaths.join('\n  - ')}`);

  await downloadArtifacts('.buildkite/artifacts/screenshots/*', 'playwright__parallel-step');
  const screenshotDir = '.buildkite/artifacts/screenshots';
  const files = fs.readdirSync(screenshotDir);

  if (files.length === 0) {
    console.log('No updated screenshots to commit');
    return;
  }
  await Promise.all<void>(
    files.map((f) =>
      decompress({
        src: path.join(screenshotDir, f),
        dest: path.join('e2e/screenshots'),
      }),
    ),
  );
  await exec('git status');

  // TODO make this shared across GitHub bot app
  const botName = 'elastic-datavis[bot]';
  const botUid = 98618603;
  await exec(`git config user.name "${botName}"`);
  await exec(`git config user.email "${botUid}+${botName}@users.noreply.github.com"`);

  const { token } = (await octokit.auth({
    type: 'installation',
  } as InstallationAuthOptions)) as InstallationAccessTokenAuthentication;

  const remoteUrl = `https://${encodeURI(botName)}:${token}@github.com/${
    bkEnv.username ?? 'elastic'
  }/elastic-charts.git`;

  const message = `test(vrt): update screenshots [skip ci]`;
  await exec('git add e2e/screenshots');
  await exec(`git commit -m "${message}"`);
  await exec(`git push ${remoteUrl} HEAD:${bkEnv.branch}`); // HEAD:* required when detached from HEAD
}

void (async () => {
  await yarnInstall('e2e');

  await setGroupStatus();

  await downloadArtifacts('.buildkite/artifacts/e2e_reports/*');

  const reportDir = '.buildkite/artifacts/e2e_reports';
  const files = fs.readdirSync(reportDir);
  await Promise.all<void>(
    files
      .filter((f) => f.startsWith('report_'))
      .map((f) =>
        decompress({
          src: path.join(reportDir, f),
          dest: path.join('e2e/reports', path.basename(f, '.gz')),
        }),
      ),
  );

  startGroup('Merging e2e reports');

  await exec('npx ts-node ./merge_html_reports.ts', {
    cwd: 'e2e',
    env: {
      HTML_REPORT_DIR: 'merged_html_report',
    },
  });

  await compress({
    src: 'e2e/merged_html_report',
    dest: '.buildkite/artifacts/merged_html_report.gz',
  });

  if (bkEnv.updateScreenshots) {
    await commitNewScreenshots();
  }
})();
