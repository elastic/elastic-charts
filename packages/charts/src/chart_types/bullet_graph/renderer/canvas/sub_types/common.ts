/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { clamp } from '../../../../../utils/common';
import { MIN_TICK_COUNT, MAX_TICK_COUNT } from '../constants';

/**
 * @internal
 */
export function maxTicksByLength(length: number, interval: number) {
  const target = Math.floor(length / interval);
  return clamp(target, MIN_TICK_COUNT, MAX_TICK_COUNT);
}
