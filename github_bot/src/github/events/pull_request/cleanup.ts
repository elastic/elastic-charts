/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Probot } from 'probot';

import { buildkiteClient } from '../../../utils/buildkite';
import { deleteDeployment } from '../../../utils/firebase';
import { commentByKey } from '../../../utils/github_utils/comments';
import { updateAllChecks } from '../../utils';

/**
 * Cleanups prs after closure. Includes:
 *
 * - cancels running buildkite builds
 * - deletes firebase deployment (auto expires after 7 days)
 * - deletes deployment issue comment
 */
export function cleanup(app: Probot) {
  // @ts-ignore - probot issue https://github.com/probot/probot/issues/1680
  app.on('pull_request.closed', async (ctx) => {
    console.log(`------- Triggered probot ${ctx.name} | ${ctx.payload.action}`);

    const { data: botComments } = await ctx.octokit.issues.listComments({
      ...ctx.repo(),
      issue_number: ctx.payload.pull_request.number,
    });

    const deployComments = botComments.filter((c) => commentByKey('deployment')(c.body));
    for (const { id } of deployComments) {
      await ctx.octokit.issues.deleteComment({
        ...ctx.repo(),
        comment_id: id,
      });
    }

    deleteDeployment(ctx.payload.number);

    const { head } = ctx.payload.pull_request;

    await buildkiteClient.cancelRunningBuilds(head.sha, async () => {
      if (!ctx.payload.pull_request.merged) {
        await updateAllChecks(ctx, {
          status: 'completed',
          conclusion: 'cancelled',
        });
      }
    });
  });
}
