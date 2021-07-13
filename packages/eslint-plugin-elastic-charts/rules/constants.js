/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const PUBLIC_TAG = '@public';
const INTERNAL_TAG = '@internal';
const ALPHA_TAG = '@alpha';
const BETA_TAG = '@beta';

// default tag to apply when missing
const DEFAULT_TAG = INTERNAL_TAG;

module.exports = {
  PUBLIC_TAG,
  INTERNAL_TAG,
  ALPHA_TAG,
  BETA_TAG,
  DEFAULT_TAG,
};
