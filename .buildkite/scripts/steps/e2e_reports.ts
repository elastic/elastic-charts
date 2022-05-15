/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import {
  bkEnv,
  exec,
  setStatus,
  downloadArtifacts,
  getJobSteps,
  startGroup,
  yarnInstall,
  compress,
  decompress,
} from '../../utils';

async function setGroupStatus() {
  const { context, stepKey } = bkEnv;

  if (!context) {
    console.warn('Error: no context found, skipping e2e group status');
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

  await setStatus({
    context,
    description,
    state: failedSteps.length > 0 ? 'failure' : 'success',
    target_url: failedSteps.length === 1 ? failedSteps[0].url ?? bkEnv.buildUrl : bkEnv.buildUrl, // could set this to e2e-report
  });
}

async function commitNewScreenshots() {
  startGroup('Commiting updated screenshots from jobs');
  downloadArtifacts('.buildkite/artifacts/screenshots/*');
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
  exec('git status');
  exec('git remote -vv');

  if (bkEnv.username) {
    exec(`git config user.name "${bkEnv.username}"`);
  }

  if (bkEnv.buildCreatorEmail) {
    exec(`git config user.email "${bkEnv.buildCreatorEmail}"`);
  }

  const message = `test(vrt): update screenshots`;
  exec('git add e2e/screenshots');
  exec(`git commit -m "${message}"`);
  exec(`git push "origin" "${bkEnv.branch}"`);
}

void (async () => {
  // yarnInstall('e2e');

  await commitNewScreenshots();

  // if (updateScreenshots) {}

  // await setGroupStatus();

  // downloadArtifacts('.buildkite/artifacts/e2e_reports/*');

  // const reportDir = '.buildkite/artifacts/e2e_reports';
  // const files = fs.readdirSync(reportDir);
  // await Promise.all<void>(
  //   files
  //     .filter((f) => f.startsWith('report_'))
  //     .map((f) =>
  //       decompress({
  //         src: path.join(reportDir, f),
  //         dest: path.join('e2e/reports', path.basename(f, '.gz')),
  //       }),
  //     ),
  // );

  // startGroup('Merging e2e reports');

  // exec('npx ts-node ./merge_html_reports.ts', {
  //   cwd: 'e2e',
  //   env: {
  //     HTML_REPORT_DIR: 'merged_html_report',
  //   },
  // });

  // await compress({
  //   src: 'e2e/merged_html_report',
  //   dest: '.buildkite/artifacts/merged_html_report.gz',
  // });
})();
