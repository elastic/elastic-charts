/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { PointerState } from '../pointer_states';

/** @internal */
export function isClicking(prevClick: PointerState | null, lastClick: PointerState | null) {
  return lastClick && (!prevClick || prevClick.time !== lastClick.time);
}
