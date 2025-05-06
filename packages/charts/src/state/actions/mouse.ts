/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';

import type { KeyPressed } from '../../utils/keys';
import type { Point } from '../../utils/point';

interface MouseAction {
  position: Point;
  time: number;
  keyPressed: KeyPressed;
}

/**
 * Action called on mouse button down event
 * @param position the x and y position (native event offsetX, offsetY)
 * @param time the timestamp of the event (native event timeStamp)
 * @internal
 */
export const onMouseRightClick = createAction<MouseAction>('ON_MOUSE_RIGHT_CLICK');

/**
 * Action called on mouse button down event
 * @param position the x and y position (native event offsetX, offsetY)
 * @param time the timestamp of the event (native event timeStamp)
 * @internal
 */
export const onMouseDown = createAction<MouseAction>('ON_MOUSE_DOWN');

/**
 * Action called on mouse button up event
 * @param position the x and y position (native event offsetX, offsetY)
 * @param time the timestamp of the event (native event timeStamp)
 * @internal
 */
export const onMouseUp = createAction<MouseAction>('ON_MOUSE_UP');

/**
 * Action called with the mouse coordinates relatives to the chart container (exclude the legend)
 * @param position the x and y position (native event offsetX, offsetY)
 * @param time the timestamp of the event (native event timeStamp)
 * @internal
 */
export const onPointerMove = createAction<Omit<MouseAction, 'keyPressed'>>('ON_POINTER_MOVE');
