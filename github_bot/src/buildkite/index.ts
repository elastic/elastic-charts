/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Router } from 'express';

import { handleFinishedBuild } from './finished_build';
import type { BuildkiteWebhookPayload } from './types';
import { getConfig } from '../config';
interface RouteParams {
  nonce?: string;
}

export function setupBuildkiteRoutes(router: Router) {
  router.post<'/', any, any, BuildkiteWebhookPayload, RouteParams>('/', (req, res) => {
    const { webhookNonce } = getConfig().buildkite;

    // TODO find why buildkite doesn't send token in headers
    // see https://buildkite.com/docs/apis/webhooks#webhook-token
    if (req.query.nonce !== webhookNonce) {
      return res.sendStatus(401);
    }

    const body = req.body;

    switch (req.headers['x-buildkite-event']) {
      case 'build.finished':
        void handleFinishedBuild(body, res);
        return;
      default: // nothing to do
        res.sendStatus(204);
        return;
    }
  });
}
