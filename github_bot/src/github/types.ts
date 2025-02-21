/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { EmitterWebhookEventName, EmitterWebhookEvent } from '@octokit/webhooks';
import type { WebhookEvent } from '@octokit/webhooks-types'; // eslint-disable-line import/no-unresolved
import type { Context, Probot } from 'probot';

export type EventSetupFn = (app: Probot) => void;

export type ProbotEventContext<E extends EmitterWebhookEventName> = EmitterWebhookEvent<E> &
  Omit<Context, keyof WebhookEvent>;

export type ProbotEventPayload<E extends EmitterWebhookEventName> = ProbotEventContext<E>['payload'];
