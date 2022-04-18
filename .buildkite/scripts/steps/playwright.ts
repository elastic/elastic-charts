/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getMetadata } from 'buildkite-agent-node';

import { exec, yarnInstall } from '../../utils';
import { getNumber } from '../../utils/common';
import { ENV_URL, MetaDataKeys } from '../../utils/constants';

const jobIndex = getNumber(process.env.BUILDKITE_PARALLEL_JOB);
const jobTotal = getNumber(process.env.BUILDKITE_PARALLEL_JOB_COUNT);

const shard = jobIndex !== null && jobTotal !== null ? ` --shard=${jobIndex + 1}/${jobTotal}` : '';

(async () => {
  yarnInstall();

  const envUrl = await getMetadata(MetaDataKeys.deploymentUrl);
  console.log('envUrl', envUrl);

  exec(`yarn test:playwright --project=Chrome${shard} line_stories.test.ts`, {
    cwd: './e2e',
    env: {
      [ENV_URL]: envUrl ?? 'https://ech-e2e-ci--pr-1652-j2ovg5rl.web.app/e2e',
    },
  });
})();
