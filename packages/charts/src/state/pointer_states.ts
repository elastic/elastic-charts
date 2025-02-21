/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Point } from '../utils/point';

/** @internal */
export interface PointerState {
  position: Point;
  time: number;
}

/** @internal */
export interface DragState {
  start: PointerState;
  end: PointerState;
}

/** @internal */
export interface PointerStates {
  dragging: boolean;
  current: PointerState;
  down: PointerState | null;
  pinned: PointerState | null;
  up: PointerState | null;
  lastDrag: DragState | null;
  lastClick: PointerState | null;
}
