/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import fs from 'fs';
import path from 'path';

import { getMetadata, setMetadata } from 'buildkite-agent-node';

import { updateCheckStatus } from './../../utils/github';
import {
  exec,
  downloadArtifacts,
  startGroup,
  yarnInstall,
  getNumber,
  decompress,
  compress,
  bkEnv,
  ScreenshotMeta,
} from '../../utils';
import { ENV_URL } from '../../utils/constants';

const jobIndex = getNumber(process.env.BUILDKITE_PARALLEL_JOB);
const shardIndex = jobIndex ? jobIndex + 1 : 1;
const jobTotal = getNumber(process.env.BUILDKITE_PARALLEL_JOB_COUNT);

const pwFlags = ['--project=Chrome'];

if (bkEnv.steps.playwright.updateScreenshots) {
  pwFlags.push('--update-snapshots');
}

if (jobIndex !== null && jobTotal !== null) {
  pwFlags.push(`--shard=${shardIndex}/${jobTotal}`);
}

async function compressNewScreenshots() {
  await exec('git add e2e/screenshots');

  const output = await exec(`git --no-pager diff --cached --name-only --diff-filter=ACMRU e2e/screenshots | cat`, {
    stdio: 'pipe',
  });
  const updatedScreenshotFiles = output.trim().split(/\n/).filter(Boolean);
  const meta: ScreenshotMeta = {
    files: updatedScreenshotFiles,
  };
  fs.mkdirSync('.buildkite/artifacts/screenshot_meta', { recursive: true });
  fs.writeFileSync(`.buildkite/artifacts/screenshot_meta/shard_${shardIndex}.json`, JSON.stringify(meta));

  if (updatedScreenshotFiles.length > 0) {
    const uploadDir = 'e2e/screenshots/__upload';
    updatedScreenshotFiles
      .filter((f) => f.endsWith('.png'))
      .forEach((file) => {
        const dest = file.replace('e2e/screenshots', uploadDir);
        fs.mkdirSync(path.dirname(dest), { recursive: true });

        fs.copyFileSync(file, dest);
      });

    await compress({
      src: uploadDir,
      dest: `.buildkite/artifacts/screenshots/shard_${shardIndex}.gz`,
    });
    console.log(`Found ${updatedScreenshotFiles.length} screenshot${
      updatedScreenshotFiles.length === 1 ? '' : 's'
    } to be updated:
  - ${updatedScreenshotFiles.join('\n  - ')}`);
  } else {
    console.log('No screenshots to be updated');
  }
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
    'playwright',
    `${activeJobs} of ${jobTotal ?? 1} jobs started`,
  );

  const src = '.buildkite/artifacts/e2e_server.gz';
  await downloadArtifacts(src, 'build_e2e');
  await decompress({
    src,
    dest: 'e2e/server',
  });

  startGroup('Check Architecture');
  await exec('arch');

  startGroup('Generating test examples.json');
  // TODO Fix this duplicate script that allows us to skip root node install on all e2e test runners
  await exec('node ./e2e/scripts/extract_examples.js');

  startGroup('Running e2e playwright job');
  const reportDir = `reports/report_${shardIndex}`;
  async function postCommandTasks() {
    await compress({
      src: path.join('e2e', reportDir),
      dest: `.buildkite/artifacts/e2e_reports/report_${shardIndex}.gz`,
    });

    if (bkEnv.steps.playwright.updateScreenshots) {
      await compressNewScreenshots();
    }
  }

  const command = `yarn playwright test ${pwFlags.join(' ')}`;

  try {
    await exec(command, {
      cwd: 'e2e',
      env: {
        [ENV_URL]: 'http://127.0.0.1:9002',
        PLAYWRIGHT_HTML_REPORT: reportDir,
        PLAYWRIGHT_JSON_OUTPUT_NAME: `reports/json/report_${shardIndex}.json`,
      },
    });
    await postCommandTasks();
  } catch (error) {
    await postCommandTasks();
    throw error;
  }
})();
