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
  firebaseDeploy,
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

void (async () => {
  // await setGroupStatus();

  fs.mkdirSync('./e2e-server/public/e2e-report', { recursive: true });

  yarnInstall();
  yarnInstall('e2e');

  downloadArtifacts('.buildkite/artifacts/e2e_reports/*');

  console.log(fs.readdirSync('.buildkite/artifacts/e2e_reports'));

  const reportDir = '.buildkite/artifacts/e2e_reports';
  const files = fs.readdirSync('.buildkite/artifacts/e2e_reports');
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

  exec('npx ts-node ./merge_html_reports.ts', {
    cwd: 'e2e',
    env: {
      HTML_REPORT_DIR: 'e2e-report',
      HTML_REPORT_PATH: '../e2e-server/public',
    },
  });

  const hasE2EReportIndex = fs.existsSync('./e2e-server/public/e2e-report/index.html');
  if (hasE2EReportIndex) {
    void firebaseDeploy({ redeploy: true });
  }

  // downloadArtifacts('e2e-server/public/*', 'storybook', undefined, 'a79cece9-acec-43f2-afde-e5b815446e82');

  // downloadArtifacts('e2e-server/public/e2e/*', 'e2e_server', undefined, 'a79cece9-acec-43f2-afde-e5b815446e82');

  // startGroup('Checking deployment files');

  // const hasStorybookIndex = fs.existsSync('./e2e-server/public/index.html');
  // const hasE2EIndex = fs.existsSync('./e2e-server/public/e2e/index.html');
  // const hasE2EReportIndex = fs.existsSync('./e2e-server/public/e2e-report/index.html');

  // console.log(`Has storybook index.html: ${hasStorybookIndex}`);
  // console.log(`Has e2e index.html: ${hasE2EIndex}`);
  // console.log(`Has e2e-report index.html: ${hasE2EReportIndex}`);

  // if (hasStorybookIndex && hasE2EIndex && hasE2EReportIndex) {
  //   void firebaseDeploy({ redeploy: true });
  // } else {
  //   throw new Error('Error: Missing deployment files in e2e-server/public');
  // }
})();
