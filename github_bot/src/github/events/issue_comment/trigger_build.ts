/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Probot } from 'probot';

import { getPRFromComment, hasCommentAction } from './utils';
import { buildkiteClient, getPRBuildParams } from '../../../utils/buildkite';
import { PullRequestBuildEnv } from '../../../utils/types';
import { checkUserFn, createIssueReaction, isValidUser, labelCheckFn, updateAllChecks } from '../../utils';

/**
 * build trigger for PR comment
 */
export function setupBuildTrigger(app: Probot) {
  // @ts-ignore - TS complains here about ctx being too large of a union
  app.on('issue_comment.created', async (ctx) => {
    if (!hasCommentAction(ctx, ['test', 'updateVrt']) || checkUserFn(ctx.payload.sender)('bot')) return;
    console.log(`------- Triggered probot ${ctx.name} | ${ctx.payload.action}`);

    const isPR = Boolean(ctx.payload.issue.pull_request);
    const pullRequest = isPR && (await getPRFromComment(ctx));
    if (!pullRequest) {
      await createIssueReaction(ctx, 'confused');
      return;
    }
    const { head, base, number, labels = [] } = pullRequest;
    const labelCheck = labelCheckFn(labels);

    if (labelCheck('skip')) {
      await ctx.octokit.issues.removeLabel({
        ...ctx.issue(),
        name: 'ci:skip',
      });
    }

    if (!labelCheck('ciApproved') && !(await isValidUser(ctx))) {
      await createIssueReaction(ctx, '-1');
      return;
    }

    const { status, data: commit } = await ctx.octokit.repos.getCommit({
      ...ctx.repo(),
      ref: head.sha,
    });
    if (status !== 200) throw new Error('Unable to find commit for ref');

    await createIssueReaction(ctx, '+1');
    await buildkiteClient.cancelRunningBuilds(head.sha, async (buildUrl) => {
      await updateAllChecks(
        ctx,
        {
          status: 'completed',
          conclusion: 'cancelled',
        },
        buildUrl,
        false,
        head.sha,
      );
    });
    const build = await buildkiteClient.triggerBuild<PullRequestBuildEnv>({
      branch: `${head.repo?.owner.login}:${head.ref}`,
      commit: head.sha,
      message: commit.commit.message,
      ignore_pipeline_branch_filters: true,
      pull_request_base_branch: base.ref,
      pull_request_id: number,
      pull_request_repository: head.repo?.git_url,
      env: getPRBuildParams(pullRequest, commit, hasCommentAction(ctx, 'updateVrt')),
    });

    await updateAllChecks(
      ctx,
      {
        status: 'queued',
      },
      build.web_url,
      true,
      head.sha,
    );
  });
}
