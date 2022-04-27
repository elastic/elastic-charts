/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  exec,
  downloadArtifacts,
  uploadArtifacts,
  startGroup,
  yarnInstall,
  getNumber,
  decompress,
  compress,
} from '../../utils';
import { ENV_URL } from '../../utils/constants';

const jobIndex = getNumber(process.env.BUILDKITE_PARALLEL_JOB);
const jobTotal = getNumber(process.env.BUILDKITE_PARALLEL_JOB_COUNT);

const shard = jobIndex !== null && jobTotal !== null ? ` --shard=${jobIndex + 1}/${jobTotal}` : '';

void (async () => {
  yarnInstall('e2e');

  const src = '.buildkite/artifacts/e2e_server.gz';
  downloadArtifacts(src, 'e2e_server', undefined, 'fd2c3cce-376a-4f1d-9764-24b3ff1dca69');
  await decompress({
    src,
    dest: 'e2e/server',
  });

  // downloadArtifacts('e2e-server/public/e2e/*', 'e2e_server', undefined, 'a79cece9-acec-43f2-afde-e5b815446e82');

  startGroup('Generating test examples.json');
  // TODO Fix this duplicate script that allows us to skip root node install on all e2e test runners
  exec('node ./e2e/scripts/extract_examples.js');

  startGroup('Running e2e playwright job');
  const reportDir = `./reports/report_${(jobIndex ?? 0) + 1}`;
  // exec(`yarn playwright test --project=Chrome${shard}`, {
  exec(`yarn playwright test --project=Chrome timezone.test.ts`, {
    cwd: './e2e',
    env: {
      [ENV_URL]: 'http://127.0.0.1:9002',
      PLAYWRIGHT_HTML_REPORT: reportDir,
    },
  });

  await compress({
    src: reportDir,
    dest: `./.buildkite/artifacts/e2e_reports/report_${(jobIndex ?? 0) + 1}.gz`,
  });
  uploadArtifacts('.buildkite/artifacts/e2e_reports/*');
})();
