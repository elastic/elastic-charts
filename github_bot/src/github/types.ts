/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { WebhookEvents, WebhookEvent, EventTypesPayload } from '@octokit/webhooks';
import { Context, Probot } from 'probot';

import { PullRequestContext, PushContext } from '../utils/types';

export type PullRequestPayload = PullRequestContext['payload'];
export type PushPayload = PushContext['payload'];

export type EventSetupFn = (app: Probot) => void;

export type ProbotEventContext<E extends WebhookEvents> = EventTypesPayload[E] & Omit<Context, keyof WebhookEvent>;
