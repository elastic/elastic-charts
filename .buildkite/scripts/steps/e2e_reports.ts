/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';

import {
  bkEnv,
  exec,
  setStatus,
  firebaseDeploy,
  getArtifacts,
  getJobSteps,
  startGroup,
  yarnInstall,
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

  setStatus({
    context,
    description,
    state: failedSteps.length > 0 ? 'failure' : 'success',
    target_url: failedSteps.length === 1 ? failedSteps[0].url ?? bkEnv.buildUrl : bkEnv.buildUrl, // could set this to e2e-report
  });
}

(async () => {
  await setGroupStatus();

  fs.mkdirSync('./e2e-server/public/e2e', { recursive: true });

  getArtifacts('e2e-server/public/*', 'storybook');

  getArtifacts('e2e-server/public/e2e/*', 'e2e_server');

  startGroup('Checking deployment files');

  getArtifacts('e2e/reports/*');

  yarnInstall('e2e');

  startGroup('Merging e2e reports');

  exec('npx ts-node ./merge_html_reports.ts', {
    cwd: 'e2e',
    env: {
      HTML_REPORT_DIR: 'e2e-report',
      HTML_REPORT_PATH: '../e2e-server/public',
    },
  });

  const hasStorybookIndex = fs.existsSync('./e2e-server/public/index.html');
  const hasE2EIndex = fs.existsSync('./e2e-server/public/e2e/index.html');
  const hasE2EReportIndex = fs.existsSync('./e2e-server/public/e2e-report/index.html');

  if (hasStorybookIndex && hasE2EIndex && hasE2EReportIndex) {
    firebaseDeploy();
  } else {
    throw new Error('Error: Missing deployment files in e2e-server/public');
  }
})();
