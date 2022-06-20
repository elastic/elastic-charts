/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Probot } from 'probot';

import { getConfig } from '../../../config';
import { buildkiteClient, getPRBuildParams } from '../../../utils/buildkite';
import { getComment } from '../../../utils/github_utils/comments';
import { PullRequestBuildEnv } from '../../../utils/types';
import { ProbotEventPayload } from '../../types';
import {
  labelCheckFn,
  checkCommitFn,
  isApprovedPR,
  postIssueComment,
  checkUserFn,
  updateChecks,
  testPatternString,
} from '../../utils';
import { getBuildConfig } from './../../../build';

const prActionTriggers = new Set<ProbotEventPayload<'pull_request'>['action']>([
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
    if (
      !prActionTriggers.has(ctx.payload.action) ||
      checkUserFn(ctx.payload.sender)('bot') ||
      !getConfig().github.env.branch.base.some(testPatternString(ctx.payload.pull_request.base.ref))
    )
      return;
    console.log(`------- Triggered probot ${ctx.name} | ${ctx.payload.action}`);

    const { head, base, number, labels = [] } = ctx.payload.pull_request;
    const labelCheck = labelCheckFn(labels);

    if (!labelCheck('buildkite')) return;
    if (labelCheck('skip')) {
      if (ctx.payload.action === 'labeled') {
        // Try to cancel any running buildkite build for ref
        await buildkiteClient.cancelRunningBuilds(head.sha, async (buildUrl) => {
          await updateChecks(ctx, buildUrl);
        });
      } else if (['synchronize', 'opened', 'reopened'].includes(ctx.payload.action)) {
        await updateChecks(ctx);
      }

      return;
    }

    if (!(await isApprovedPR(ctx))) {
      await postIssueComment(ctx, getComment('communityPR'));

      return;
    }

    const builds = await buildkiteClient.getRunningBuilds(head.sha);

    // Already has a running build on latest commit
    if (builds.length > 0) return;

    const { status, data: commit } = await ctx.octokit.repos.getCommit({
      ...ctx.repo(),
      ref: head.sha,
    });
    if (status !== 200) throw new Error('Unable to find commit for ref');

    if (checkCommitFn(commit.commit.message)('skip', true)) return;

    await buildkiteClient.triggerBuild<PullRequestBuildEnv>({
      branch: head.label, // user:branch
      commit: head.sha,
      ignore_pipeline_branch_filters: true,
      pull_request_base_branch: base.ref,
      pull_request_id: number,
      pull_request_repository: head.repo.git_url,
      env: getPRBuildParams(ctx.payload.pull_request, commit),
    });

    await updateChecks(
      ctx,
      undefined,
      {
        status: 'queued',
      },
      ['labeled', 'unlabeled'].includes(ctx.payload.action),
    );
  });
}
