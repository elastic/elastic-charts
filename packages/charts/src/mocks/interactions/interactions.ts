/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Store } from 'redux';

import type { KeyPressed } from '../../specs';
import { onMouseDown, onMouseUp, onPointerMove } from '../../state/actions/mouse';
import type { GlobalChartState } from '../../state/chart_state';

const INITIAL_POSITION = { x: 0, y: 0 };
const POSITION = { x: 50, y: 75 };

export function simulateBrushSequence({
  store,
  start = INITIAL_POSITION,
  end = POSITION,
  time = [0, 100, 200],
  keysOnMouseDown = undefined,
}: {
  store: Store<GlobalChartState>;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  time?: [number, number, number];
  keysOnMouseDown?: KeyPressed;
}) {
  store.dispatch(onMouseDown({ position: start, time: time[0], keyPressed: keysOnMouseDown }));
  store.dispatch(onPointerMove({ position: end, time: time[1] }));
  store.dispatch(onMouseUp({ position: end, time: time[2] }));
}

export function simulateClickSequence({
  store,
  position = POSITION,
  time = [0, 100, 200],
  keysOnMouseDown = undefined,
}: {
  store: Store<GlobalChartState>;
  position?: { x: number; y: number };
  time?: [number, number, number];
  keysOnMouseDown?: KeyPressed;
}) {
  store.dispatch(onPointerMove({ position, time: time[0] }));
  store.dispatch(onMouseDown({ position, time: time[1], keyPressed: keysOnMouseDown }));
  store.dispatch(onMouseUp({ position, time: time[2] }));
}
