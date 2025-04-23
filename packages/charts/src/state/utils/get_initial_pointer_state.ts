/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { PointerStates } from '../pointer_states';

/** @internal */
export const getInitialPointerState = (): PointerStates => ({
  dragging: false,
  current: { position: { x: -1, y: -1 }, time: 0 },
  pinned: null,
  down: null,
  up: null,
  lastDrag: null,
  lastClick: null,
  keyPressed: {},
});
