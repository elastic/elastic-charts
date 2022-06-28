/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Probot } from 'probot';

import { buildkiteClient } from '../../../utils/buildkite';
import { updateLastDeployment } from '../../../utils/github_utils/deployments';

/**
 * Cleanups prs after closure. Includes:
 *
 * - cancels running buildkite builds
 * - sets GitHub deployment to inactive
 *
 * TODOs
 * - deletes firebase deployment (auto expires after 7 days)
 */
export function cleanup(app: Probot) {
  app.on(['pull_request.closed'], async (ctx) => {
    console.log(`------- Triggered probot ${ctx.name} | ${ctx.payload.action}`);

    const { head } = ctx.payload.pull_request;

    await buildkiteClient.cancelRunningBuilds(head.sha);

    await updateLastDeployment(ctx);
  });
}
