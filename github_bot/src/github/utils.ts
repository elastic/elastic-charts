/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { components } from '@octokit/openapi-types';
import { RestEndpointMethodTypes } from '@octokit/rest';

import { getConfig } from './../config';
import { chartsRepoId } from './constants';
import { ProbotEventContext, ProbotEventPayload } from './types';

type GetPullResponseData = RestEndpointMethodTypes['pulls']['get']['response']['data'];

const skipLabelPatterns: Array<string | RegExp> = ['skip-ci'];

export function isBaseRepo({
  id,
  fork,
  name,
  owner,
}: ProbotEventPayload<'pull_request'>['repository'] | GetPullResponseData['base']['repo']) {
  // TODO decide if secondary check is needed
  if (id === chartsRepoId) return true;
  return !fork && owner.login === 'elastic' && name === 'elastic-charts';
}

export function hasSkipLabel(
  labels: ProbotEventPayload<'pull_request'>['pull_request']['labels'] | GetPullResponseData['labels'],
) {
  return labels.some(({ name }) => skipLabelPatterns.some(testPatternString(name)));
}

export function testPatternString(testStr: string, partial = false) {
  return (pattern: string | RegExp) =>
    typeof pattern === 'string' ? (partial ? testStr.includes(pattern) : testStr === pattern) : pattern.test(testStr);
}

export async function createIssueReaction(
  ctx: ProbotEventContext<'issue_comment'>,
  content: RestEndpointMethodTypes['reactions']['createForIssueComment']['parameters']['content'],
) {
  await ctx.octokit.reactions.createForIssueComment({
    ...ctx.issue(),
    comment_id: ctx.payload.comment.id,
    content,
  });
}

const devLabelId = 4236007864;
const buildkiteGHLabelId = 4225285931;

/**
 * Checks if event should be ignored based on dev and prod mode
 * Returns true if event should be skipped.
 *
 * TODOs:
 *  - find a way to do this for all supported events
 *  - find a way to perform this globally in an express middleware
 */
export function shouldIgnoreEvent(
  eventCtx: ProbotEventContext<'issue_comment'>,
  pullRequest: components['schemas']['pull-request'],
): boolean;
export function shouldIgnoreEvent(eventCtx: ProbotEventContext<'pull_request'>): boolean;
export function shouldIgnoreEvent(
  eventCtx: ProbotEventContext<any>,
  extra?: components['schemas']['pull-request'],
): boolean {
  const { isDev, isProd } = getConfig();

  switch (eventCtx.name) {
    case 'pull_request': {
      const { labels } = eventCtx.payload.pull_request;
      const hasBKLabel = labels.some(({ id }) => id === buildkiteGHLabelId);

      if (!hasBKLabel) return true;

      const hasDevLabel = labels.some(({ id }) => id === devLabelId);
      return hasDevLabel ? isProd : isDev;
    }
    case 'issue_comment': {
      const { labels } = extra;
      const hasBKLabel = labels.some(({ id }) => id === buildkiteGHLabelId);

      if (!hasBKLabel) return true;

      const hasDevLabel = labels.some(({ id }) => id === devLabelId);
      return hasDevLabel ? isProd : isDev;
    }
    default:
      return false;
  }
}
