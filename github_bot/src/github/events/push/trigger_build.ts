/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Probot } from 'probot';

import { buildkiteClient } from '../../../utils/buildkite';
import { PushPayload } from '../../types';
import { isBaseRepo, testPatternString } from '../../utils';

export const branchPatterns: Array<string | RegExp> = ['master', 'alpha', 'next', /\d+.\d+.\d+/, /\d+.\d+.x/, /\d+.x/];

/**
 * build trigger for pushes to select base branches not pull requests
 */
export function setupBuildTrigger(app: Probot) {
  app.on('push', async (ctx) => {
    const [branchName] = ctx.payload.ref.split('/').reverse();

    if (isBaseRepo(ctx.payload.repository) && branchPatterns.some(testPatternString(branchName))) {
      await triggerBuild(branchName, ctx.payload);
    }
  });
}

async function triggerBuild(branch: string, { after }: PushPayload) {
  await buildkiteClient.triggerBuild({
    branch,
    commit: after,
    ignore_pipeline_branch_filters: true,
  });
}
