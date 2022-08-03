/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable unicorn/prefer-export-from */

import { debounce as debounceLodash } from 'lodash';

// Need ability to flush debouncer in unit tests. Otherwise functions the same
export const debounce = debounceLodash;

/* eslint-enable unicorn/prefer-export-from */
