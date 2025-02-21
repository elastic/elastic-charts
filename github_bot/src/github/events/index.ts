/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Probot } from 'probot';

import { setupFns as issueCommentSetupFns } from './issue_comment';
import { setupFns as prSetupFns } from './pull_request';
import { setupFns as pushSetupFns } from './push';

export function setupGithubEvents(app: Probot) {
  prSetupFns.forEach((setup) => setup(app));
  pushSetupFns.forEach((setup) => setup(app));
  issueCommentSetupFns.forEach((setup) => setup(app));
}
