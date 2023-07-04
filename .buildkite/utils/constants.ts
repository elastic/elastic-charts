/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Meta data keys for buildkite meta data
 */
export const MetaDataKeys = {
  skipDeployment: 'skipDeployment',
  deploymentId: 'deploymentId',
  deploymentCommentId: 'deploymentCommentId',
  deploymentPreviousSha: 'deploymentPreviousSha',
  deploymentStatus: 'deploymentStatus',
  deploymentUrl: 'deploymentUrl',
};

/**
 * Commit context to update GitHub status
 */
export const DEFAULT_FIREBASE_URL = 'https://ech-e2e-ci.web.app/';

/**
 * Commit context to update GitHub status
 */
export const ECH_CHECK_ID = 'ECH_CHECK_ID';
/**
 * Environment url to point e2e tests at
 */
export const ENV_URL = 'ENV_URL';
