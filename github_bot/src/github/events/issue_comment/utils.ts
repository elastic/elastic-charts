/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { components } from '@octokit/openapi-types';

import { ProbotEventContext } from '../../types';
import { createIssueReaction } from '../../utils';

export async function getPRFromComment(
  ctx: ProbotEventContext<'issue_comment'>,
): Promise<components['schemas']['pull-request'] | null> {
  const isPR = !!ctx.payload.issue.pull_request;

  if (!isPR) return null;

  try {
    const { status, data: pullRequest } = await ctx.octokit.pulls.get(ctx.pullRequest());
    if (status !== 200 || !pullRequest) return null;
    return pullRequest;
  } catch (error) {
    console.error(error);
    await createIssueReaction(ctx, '-1');
    throw new Error(String(error));
  }
}

const ciNamePattern = /^(buildkite|datavis) /i;

const actions = {
  test: /^test/i,
  updateVrt: /^update (screenshots|vrt)/i,
};
type Actions = typeof actions;

/**
 * Checks if issue comment action matches expected
 */
export function hasCommentAction<T extends keyof Actions>(ctx: ProbotEventContext<'issue_comment'>, action: T): boolean;
export function hasCommentAction<T extends keyof Actions>(
  ctx: ProbotEventContext<'issue_comment'>,
  action: T[],
): boolean;
export function hasCommentAction<T extends keyof Actions>(
  ctx: ProbotEventContext<'issue_comment'>,
  actionKey: T | T[],
): boolean {
  const actionKeys = Array.isArray(actionKey) ? actionKey : [actionKey];
  const { body } = ctx.payload.comment;
  if (!ciNamePattern.test(body)) return false;
  const actionText = body.replace(ciNamePattern, '');
  const foundActions = actionKeys.filter((k) => actions[k].test(actionText));

  return foundActions.length > 0;
}
