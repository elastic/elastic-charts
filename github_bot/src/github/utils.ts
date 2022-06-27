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
    if ((error as any).status !== 404) {
      throw new Error(String(error));
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
    if ((error as any).status !== 404) {
      throw new Error(String(error));
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

export async function updateAllChecks(
  ctx: ProbotEventContext<'issue_comment'>,
  buildUrl?: string,
  options?: Partial<Pick<components['schemas']['check-run'], 'status' | 'conclusion'>>,
  createNew?: boolean,
  pullRequest?: components['schemas']['pull-request'] | null,
): Promise<void>;
export async function updateAllChecks(
  ctx: ProbotEventContext<'pull_request'>,
  buildUrl?: string,
  options?: Partial<Pick<components['schemas']['check-run'], 'status' | 'conclusion'>>,
  createNew?: boolean,
): Promise<void>;
export async function updateAllChecks(
  ctx: ProbotEventContext<'pull_request' | 'issue_comment'>,
  buildUrl?: string,
  options: Partial<Pick<components['schemas']['check-run'], 'status' | 'conclusion'>> = {
    status: 'completed',
    conclusion: 'skipped',
  },
  createNew: boolean = false,
  pullRequest: components['schemas']['pull-request'] | null = null,
): Promise<void> {
  const pr = ctx.name === 'issue_comment' ? pullRequest : ctx.payload.pull_request;
  if (!pr) throw new Error('No pull request found to set check run');
  const { head } = pr;
  const { main, jobs } = getBuildConfig(false);
  const updatedCheckIds = new Set<string>();

  if (!createNew) {
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
            details_url: buildUrl || details_url,
            ...options,
          });
        }
        updatedCheckIds.add(external_id!);
      }),
    );
  }

  await Promise.all(
    [main, ...jobs]
      .filter(({ id }) => !updatedCheckIds.has(id))
      .map(async ({ id, name }) => {
        await ctx.octokit.checks.create({
          name,
          ...ctx.repo(),
          head_sha: head.sha,
          external_id: id,
          details_url: buildUrl,
          ...options,
        });
      }),
  );
}

export async function syncChecks(ctx: ProbotEventContext<'pull_request'>, baseSha?: string) {
  console.log('syncChecks');

  const [, previousCommitSha] = await getLatestCommits(ctx);

  console.log('previousCommitSha', previousCommitSha);

  const {
    data: { check_runs: checks },
  } = await ctx.octokit.checks.listForRef({
    ...ctx.repo(),
    ref: baseSha ?? ctx.payload.pull_request.head.sha,
    app_id: Number(getConfig().github.auth.appId),
  });

  console.log('checks');
  console.log(checks);

  await Promise.all(
    checks.map(async (check) => {
      return await ctx.octokit.checks.create({
        ...ctx.repo(),
        ...check,
        head_sha: previousCommitSha,
      });
    }),
  );
}

interface PRCommitResponse {
  data: {
    repository: {
      pullRequest: {
        commits: {
          nodes: [
            {
              commit: {
                message: string;
                oid: string;
              };
            },
          ];
        };
      };
    };
  };
}

export async function getLatestCommits(ctx: ProbotEventContext<'pull_request'>, count = 2): Promise<string[]> {
  console.log('getLatestCommits');

  const { owner, repo, pull_number } = ctx.pullRequest();
  const { data } = await ctx.octokit.graphql<PRCommitResponse>(`query getLatestCommits {
    repository(owner: "${owner}", name: "${repo}") {
      pullRequest(number: ${pull_number}) {
        commits(last: ${count}) {
          nodes {
            commit {
              message
              oid
            }
          }
        }
      }
    }
  }`);

  return data.repository.pullRequest.commits.nodes.map((n) => n.commit.oid);
}

// TODO remove or use this function
export async function updatePreviousDeployments(
  ctx: ProbotEventContext<'pull_request'>,
  state: RestEndpointMethodTypes['repos']['createDeploymentStatus']['parameters']['state'] = 'inactive',
) {
  const { data: deployments } = await ctx.octokit.repos.listDeployments({
    ...ctx.repo(),
    ref: ctx.payload.pull_request.head.ref,
    per_page: 100,
  });

  await Promise.all(
    deployments.map(async ({ id }) => {
      const {
        data: [{ environment, state: currentState, ...status }],
      } = await ctx.octokit.repos.listDeploymentStatuses({
        ...ctx.repo(),
        deployment_id: id,
        per_page: 1,
      });

      if (['in_progress', 'queued', 'pending'].includes(currentState)) {
        await ctx.octokit.repos.createDeploymentStatus({
          ...ctx.repo(),
          ...status,
          // @ts-ignore - bad type for environment
          environment,
          state,
        });
      }
    }),
  );
}
