/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import path from 'path';

import { getMetadata, setMetadata } from 'buildkite-agent-node';

import { updateCheckStatus } from './../../utils/github';
import { exec, downloadArtifacts, startGroup, yarnInstall, getNumber, decompress, compress, bkEnv } from '../../utils';
import { ENV_URL } from '../../utils/constants';

const jobIndex = getNumber(process.env.BUILDKITE_PARALLEL_JOB);
const shardIndex = jobIndex ? jobIndex + 1 : 1;
const jobTotal = getNumber(process.env.BUILDKITE_PARALLEL_JOB_COUNT);

const pwFlags = ['--project=Chrome', '--config=playwright.a11y.config.ts'];

if (jobIndex !== null && jobTotal !== null) {
  pwFlags.push(`--shard=${shardIndex}/${jobTotal}`);
}

void (async () => {
  await yarnInstall('e2e');

  const key = `${bkEnv.checkId}--activeJobs`;
  const value = shardIndex === jobTotal ? jobTotal - 1 : Number(await getMetadata(key));
  // TODO improve this status logic, not easy to communicate state of parallel steps
  const activeJobs = Math.min((Number.isNaN(value) ? 0 : value) + 1, jobTotal ?? 1);
  await setMetadata(key, String(activeJobs));

  await updateCheckStatus(
    {
      status: 'in_progress',
    },
    'playwright_a11y',
    `${activeJobs} of ${jobTotal ?? 1} a11y jobs started`,
  );

  const src = '.buildkite/artifacts/e2e_server.gz';
  await downloadArtifacts(src, 'build_e2e');
  await decompress({
    src,
    dest: 'e2e/server',
  });

  startGroup('Check Architecture');
  await exec('arch');

  startGroup('Running e2e a11y playwright job');
  const reportDir = `reports/a11y_report_${shardIndex}`;
  async function postCommandTasks() {
    await compress({
      src: path.join('e2e', reportDir),
      dest: `.buildkite/artifacts/a11y_reports/report_${shardIndex}.gz`,
    });
  }

  const command = `yarn playwright test ${pwFlags.join(' ')}`;

  try {
    await exec(command, {
      cwd: 'e2e',
      env: {
        [ENV_URL]: 'http://127.0.0.1:9002',
        PLAYWRIGHT_HTML_REPORT: reportDir,
        PLAYWRIGHT_JSON_OUTPUT_NAME: `reports/a11y-json/report_${shardIndex}.json`,
      },
    });
    await postCommandTasks();
  } catch (error) {
    await postCommandTasks();
    throw error;
  }
})();
