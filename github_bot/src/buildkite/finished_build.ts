/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Response } from 'express';

import { getConfig } from '../config';
import { githubClient, MAIN_CI_CHECK } from '../utils/github';
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

  const {
    data: { total_count: totalCount, check_runs: checkRuns },
  } = await githubClient.octokit.checks.listForRef({
    ...githubClient.repoParams,
    ref: build?.commit,
    app_id: Number(getConfig().github.auth.appId),
  });

  console.log(checkRuns);

  if (checkRuns.length < totalCount) {
    throw new Error('Missing check runs, pagination required');
  }

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
  const mainCheckId = checkRuns.find(({ external_id }) => external_id === MAIN_CI_CHECK)?.id;

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
      name: MAIN_CI_CHECK,
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
