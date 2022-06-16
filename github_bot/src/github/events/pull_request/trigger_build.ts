/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { components } from '@octokit/openapi-types';
import { RestEndpointMethodTypes } from '@octokit/rest';
import { Probot } from 'probot';

import { buildkiteClient } from '../../../utils/buildkite';
import { githubClient } from '../../../utils/github';
import { PullRequestBuildEnv } from '../../../utils/types';
import { PullRequestPayload } from '../../types';
import { isBaseRepo, hasSkipLabel, testPatternString, shouldIgnoreEvent } from '../../utils';

const skipCommitPatterns: Array<string | RegExp> = ['[skip-ci]', '[skip ci]', '[ci skip]', '[ci-skip]'];
const updateScreenshotsCommitPatterns: Array<string | RegExp> = [
  '[update-vrt]',
  '[vrt-update]',
  '[update-screenshots]',
  '[screenshots-update]',
];
const prActionTriggers = new Set<PullRequestPayload['action']>([
  'synchronize',
  'opened',
  'reopened',
  'labeled',
  'unlabeled',
]);

/**
 * build trigger for base and 3rd - party forked branches
 */
export function setupBuildTrigger(app: Probot) {
  app.on('pull_request', async (ctx) => {
    if (shouldIgnoreEvent(ctx)) return;
    if (!prActionTriggers.has(ctx.payload.action)) return;
    console.log(`------- Triggered probot ${ctx.name} | ${ctx.payload.action}`);

    await triggerBuildFromPR(ctx.payload.pull_request, ({ commit: { author, message } }) => {
      if (!author.name) return false;

      return !skipCommitPatterns.some(testPatternString(message, true));
    });
  });
}

export async function triggerBuildFromPR(
  {
    head,
    base,
    number,
    maintainer_can_modify,
    labels = [],
    user,
  }: PullRequestPayload['pull_request'] | RestEndpointMethodTypes['pulls']['get']['response']['data'],
  shouldTrigger?: (commit: components['schemas']['commit']) => Promise<boolean> | boolean,
) {
  if (!isBaseRepo(base.repo) || hasSkipLabel(labels) || !(await githubClient.isValidUser(user))) {
    return;
  }

  const { status, data: commit } = await githubClient.octokit.repos.getCommit({
    ref: head.sha,
    repo: head.repo.name,
    owner: head.repo.owner.login,
  });
  if (status !== 200) throw new Error('Unable to find commit for ref');

  if (shouldTrigger && !(await shouldTrigger(commit))) {
    return;
  }

  const updateScreenshots = updateScreenshotsCommitPatterns.some(testPatternString(commit.commit.message, true));

  const baseBranch = base.ref;
  const buildParams: PullRequestBuildEnv = {
    GITHUB_PR_NUMBER: number.toString(),
    GITHUB_PR_TARGET_BRANCH: baseBranch,
    GITHUB_PR_BASE_OWNER: base.repo.owner.login,
    GITHUB_PR_BASE_REPO: base.repo.name,
    GITHUB_PR_OWNER: head.repo.owner.login,
    GITHUB_PR_REPO: head.repo.name,
    GITHUB_PR_BRANCH: head.ref,
    GITHUB_PR_TRIGGERED_SHA: head.sha,
    GITHUB_PR_LABELS: labels.map((label) => label.name).join(','),
    GITHUB_PR_MAINTAINER_CAN_MODIFY: String(maintainer_can_modify),
    ECH_STEP_PLAYWRIGHT_UPDATE_SCREENSHOTS: String(updateScreenshots),
  };

  await buildkiteClient.triggerBuild<PullRequestBuildEnv>({
    branch: `${head.repo.owner.login}:${head.ref}`,
    commit: head.sha,
    ignore_pipeline_branch_filters: true,
    pull_request_base_branch: baseBranch,
    pull_request_id: number,
    pull_request_repository: head.repo.git_url,
    env: buildParams,
  });
}
