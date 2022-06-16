/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Probot } from 'probot';

import { createIssueReaction, shouldIgnoreEvent } from '../../utils';
import { triggerBuildFromPR } from '../pull_request/trigger_build';
import { getPRFromComment } from './utils';

const triggerPattern = /^(buildkite|jenkins|davis) test/i;

/**
 * build trigger for PR comment
 */
export function setupBuildTrigger(app: Probot) {
  app.on('issue_comment.created', async (ctx) => {
    const pullRequest = await getPRFromComment(ctx);
    if (shouldIgnoreEvent(ctx, pullRequest)) return;
    if (!triggerPattern.test(ctx.payload.comment.body)) return;

    console.log(`------- Triggered probot ${ctx.name} | ${ctx.payload.action}`);

    await triggerBuildFromPR(pullRequest);
    await createIssueReaction(ctx, '+1');
  });
}
