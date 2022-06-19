/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { components } from '@octokit/openapi-types';
import { RestEndpointMethodTypes } from '@octokit/rest';

import { getBuildConfig } from '../build';
import { Env } from '../env';
import { githubClient } from '../utils/github';
import { getConfig } from './../config';
import { chartsRepoId } from './constants';
import { ProbotEventContext, ProbotEventPayload } from './types';

type GetPullResponseData = RestEndpointMethodTypes['pulls']['get']['response']['data'];

export function isBaseRepo({
  id,
  fork,
  name,
  owner: { login },
}: ProbotEventPayload<'pull_request'>['repository'] | GetPullResponseData['base']['repo']) {
  // TODO decide if secondary check is needed
  if (id === chartsRepoId) return true;
  const { owner, repo } = getConfig().github.env.repo;
  return !fork && login === owner && name === repo;
}

export const labelCheckFn =
  (labels: components['schemas']['pull-request']['labels']) => (labelKey: keyof Env['label']) => {
    const label = getConfig().github.env.label[labelKey];
    return labels.some(
      ({ id, name }) => id === label.id || name === label.name || label.patterns.some(testPatternString(name)),
    );
  };

export const checkCommitFn =
  (message: components['schemas']['commit']['commit']['message']) =>
  (patternKey: keyof Env['commitPattern'], exact: boolean = false) => {
    const patterns = getConfig().github.env.commitPattern[patternKey];
    return patterns.some(testPatternString(message, !exact));
  };

export const checkUserFn = (user: components['schemas']['nullable-simple-user']) =>
  !user
    ? () => false
    : (userKey: keyof Env['user']) => {
        const { id, name } = getConfig().github.env.user[userKey];
        return (id && user.id === id) || (name && user.name === name);
      };

export function testPatternString(testStr?: string, partial = false) {
  if (!testStr) return () => false;
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

const allowedUsers = new Set<string>([]);
const allowedUserIds = new Set([
  49699333, // dependabot
  29139614, // renovate
]);
const requiredPermission = new Set(['admin', 'write']);

/**
 * Validate user on series of OR conditions
 */
export async function isValidUser(ctx: ProbotEventContext<'issue_comment' | 'pull_request'>): Promise<boolean> {
  const { id, login: username } = getUser(ctx);

  // is a specific user
  if (allowedUsers.has(username) || allowedUserIds.has(id)) {
    console.log(`User ${username} is on allowed list`);
    return true;
  } else {
    console.log(`User ${username} is NOT on allowed list`);
  }

  // TODO remove orgOctokit after testing and once the app permissions include org:user:read
  try {
    // has write or admin permissions in elastic-charts
    const {
      status,
      data: { permission },
    } = await ctx.octokit.repos.getCollaboratorPermissionLevel({
      ...ctx.repo(),
      username,
    });
    console.log({ permission });

    if (status === 200 && requiredPermission.has(permission)) {
      return true;
    } else {
      console.log('user does not have correct permission');
    }
  } catch (error) {
    if (error.status !== 404) {
      throw new Error(error);
    }
  }

  try {
    // is member of elastic
    // TODO remove orgOctokit after testing and once the app permissions include org:user:read
    const { status } = await githubClient.orgOctokit.orgs.checkMembershipForUser({
      org: getConfig().github.env.repo.owner,
      username,
    });

    // @ts-ignore - bad status types
    if (status === 204) {
      return true;
    } else {
      console.log('user not a member of elastic');
    }
  } catch (error) {
    if (error.status !== 404) {
      throw new Error(error);
    }
  }

  console.log(`Ignoring pull request from user '${username}'`);
  return false;
}

export async function isApprovedPR(ctx: ProbotEventContext<'issue_comment' | 'pull_request'>): Promise<boolean> {
  const { head, base, labels } = await getPR(ctx);
  // check if pr is from base repo
  if (head.repo!.name === base.repo.name && head.repo!.owner.login === base.repo.owner.login) return true;
  return (await isValidUser(ctx)) || labelCheckFn(labels)('ciApproved');
}

export async function postIssueComment(
  ctx: ProbotEventContext<'issue_comment' | 'pull_request'>,
  body: RestEndpointMethodTypes['issues']['createComment']['parameters']['body'],
) {
  await ctx.octokit.issues.createComment({
    ...ctx.issue(),
    body,
  });
}

export function getUser(ctx: ProbotEventContext<'issue_comment' | 'pull_request'>) {
  switch (ctx.name) {
    case 'issue_comment':
      return ctx.payload.comment.user;
    case 'pull_request':
      return ctx.payload.pull_request.user;
    default:
      throw new Error('Unknown event name');
  }
}

export async function getPR(ctx: ProbotEventContext<'issue_comment' | 'pull_request'>) {
  switch (ctx.name) {
    case 'issue_comment':
      const { status, data } = await ctx.octokit.pulls.get({
        ...ctx.repo(),
        pull_number: ctx.payload.issue.number,
      });
      if (status !== 200) throw new Error('Unable to get Pull request');
      return data;
    case 'pull_request':
      return ctx.payload.pull_request;
    default:
      throw new Error('Unknown event name');
  }
}

export async function updateChecks(ctx: ProbotEventContext<'pull_request'>, buildUrl: string) {
  const { head } = ctx.payload.pull_request;
  const { main, jobs } = getBuildConfig(false);
  const updatedCheckIds = new Set<string>();

  const {
    status: resStatus,
    data: { total_count: totalCount, check_runs: checkRuns },
  } = await ctx.octokit.checks.listForRef({
    ...ctx.repo(),
    ref: head.sha,
    app_id: Number(getConfig().github.auth.appId),
    per_page: 100, // max
  });
  if (resStatus !== 200) throw new Error('Failed to get checks for ref');
  if (checkRuns.length < totalCount) {
    // TODO handle this with pagination if check runs exceed 100
    throw new Error('Missing check runs, pagination required');
  }

  console.log(checkRuns);

  await Promise.all(
    checkRuns.map(async ({ id, external_id, details_url, status }) => {
      if (status !== 'completed' || external_id === main.id) {
        await ctx.octokit.checks.update({
          ...ctx.repo(),
          check_run_id: id,
          status: 'completed',
          conclusion: 'skipped',
          details_url: details_url || buildUrl,
        });
      }
      updatedCheckIds.add(external_id!);
    }),
  );

  await Promise.all(
    [main, ...jobs]
      .filter(({ id }) => !updatedCheckIds.has(id))
      .map(async ({ id, name }) => {
        await ctx.octokit.checks.create({
          name,
          ...ctx.repo(),
          head_sha: head.sha,
          status: 'completed',
          conclusion: 'skipped',
          external_id: id,
          details_url: buildUrl,
        });
      }),
  );
}
