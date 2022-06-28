/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { RestEndpointMethodTypes } from '@octokit/rest';

import { ProbotEventContext } from '../../github/types';

export async function updateLastDeployment(
  ctx: ProbotEventContext<'pull_request'>,
  state: RestEndpointMethodTypes['repos']['createDeploymentStatus']['parameters']['state'] = 'inactive',
) {
  const { data: deployments = [] } = await ctx.octokit.repos.listDeployments({
    ...ctx.repo(),
    task: `deploy:pr:${ctx.payload.pull_request.number}`,
    per_page: 2, // in case there is on successful and one pending
  });

  for (const deployment of deployments) {
    const {
      data: [status],
    } = await ctx.octokit.repos.listDeploymentStatuses({
      ...ctx.repo(),
      deployment_id: deployment.id,
      per_page: 1,
    });

    if (!status) continue;
    const { state: currentState, log_url, environment_url } = status;

    if (!['in_progress', 'queued', 'pending', 'success'].includes(currentState)) {
      continue;
    }

    console.log(`Updating deployment ${deployment.id} state: ${currentState} -> ${state}`);

    await ctx.octokit.repos.createDeploymentStatus({
      ...ctx.repo(),
      deployment_id: deployment.id,
      description: 'Deployment destroyed after PR closed',
      log_url,
      environment_url,
      state,
    });
  }
}
