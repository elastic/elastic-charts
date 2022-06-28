/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Probot } from 'probot';

import { getConfig } from '../../../config';
import { buildkiteClient } from '../../../utils/buildkite';
import { isBaseRepo, testPatternString, updateAllChecks } from '../../utils';

/**
 * build trigger for pushes to select base branches not pull requests
 */
export function setupBuildTrigger(app: Probot) {
  app.on('push', async (ctx) => {
    const [branch] = ctx.payload.ref.split('/').reverse();

    if (!isBaseRepo(ctx.payload.repository) || !getConfig().github.env.branch.base.some(testPatternString(branch))) {
      return;
    }

    const build = await buildkiteClient.triggerBuild({
      branch,
      commit: ctx.payload.after,
      message: ctx.payload.head_commit?.message,
      ignore_pipeline_branch_filters: true,
    });

    await updateAllChecks(
      ctx,
      {
        status: 'queued',
      },
      build.web_url,
      true,
      ctx.payload.after,
    );
  });
}
