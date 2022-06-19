/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Response } from 'express';

import { getBuildConfig } from '../build';
import { getConfig } from '../config';
import { githubClient } from '../utils/github';
import { BuildkiteWebhookPayload } from './types';

/**
 * Handles Buildkite ci run cleanup for completed finished jobs
 *
 * Buildkite builds do not have a great mechanism for builds that are cancelled at a top level.
 * The only mechanism is a webhook that fires at the end of each build.
 * This function runs to cleanup the commit statuses for all build statuses.
 */
export async function handleFinishedBuild(body: BuildkiteWebhookPayload, res: Response) {
  console.log(body);

  const build = body?.build;
  if (!build || !build?.commit) {
    res.sendStatus(400); // need sha to set statuses
    return;
  }

  const { github } = getConfig();

  const {
    status: resStatus,
    data: { total_count: totalCount, check_runs: checkRuns },
  } = await githubClient.octokit.checks.listForRef({
    ...githubClient.repoParams,
    ref: build?.commit,
    app_id: Number(github.auth.appId),
    per_page: 100, // max
  });
  if (resStatus !== 200) throw new Error('Failed to get checks for ref');
  if (checkRuns.length < totalCount) {
    // TODO handle this with pagination if check runs exceed 100
    throw new Error('Missing check runs, pagination required');
  }

  console.log(checkRuns);

  const buildStatus = {
    status: 'completed',
    conclusion:
      {
        passed: 'success',
        canceled: 'cancelled',
        failed: 'failure',
      }[build.state] ?? 'failure',
  };
  const output = {
    summary: `Build ${build.state}`,
    title: `Build ${build.state}`,
  };
  const { main } = getBuildConfig(false);
  const mainCheckId = checkRuns.find(({ external_id }) => external_id === main.id)?.id;

  if (mainCheckId) {
    await githubClient.octokit.checks.update({
      ...githubClient.repoParams,
      check_run_id: mainCheckId, // required
      details_url: build.web_url,
      output,
      ...buildStatus,
    });
  } else {
    await githubClient.octokit.checks.create({
      ...githubClient.repoParams,
      head_sha: build?.commit,
      name: main.id,
      details_url: build.web_url,
      output,
      ...buildStatus,
    });
  }

  // All incomplete check after build is finished
  // TODO add a way to set initial PR checks when build never fires
  // This requires knowing the external_ids of all check to be set
  const unresolvedChecks = checkRuns.filter(({ status }) => status !== 'completed');
  await Promise.all(
    unresolvedChecks.map(({ id }) => {
      return githubClient.octokit.checks.update({
        ...githubClient.repoParams,
        check_run_id: id, // required
        output,
        ...buildStatus,
      });
    }),
  );

  res.sendStatus(200);
}
