/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { exec, getArtifacts, startGroup, yarnInstall } from '../../utils';
import { getNumber } from '../../utils/common';
import { ENV_URL } from '../../utils/constants';

const jobIndex = getNumber(process.env.BUILDKITE_PARALLEL_JOB);
const jobTotal = getNumber(process.env.BUILDKITE_PARALLEL_JOB_COUNT);

const shard = jobIndex !== null && jobTotal !== null ? ` --shard=${jobIndex + 1}/${jobTotal}` : '';

(() => {
  yarnInstall('e2e');

  getArtifacts('e2e-server/public/e2e/*', 'e2e_server', undefined, 'a79cece9-acec-43f2-afde-e5b815446e82');

  startGroup('Generating test examples.json');

  // TODO Fix this duplicate script that allows us to skip root node install on all e2e test runners
  exec('node ./e2e/scripts/extract_examples.js');

  startGroup('Running e2e playwright job');

  exec(`yarn test:playwright --project=Chrome${shard}`, {
    cwd: './e2e',
    env: {
      [ENV_URL]: 'file:///app/e2e-server/public/e2e/index.html',
      PLAYWRIGHT_HTML_REPORT: `reports/report_${(jobIndex ?? 0) + 1}`,
    },
  });
})();
