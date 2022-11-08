/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Point } from '../../utils/point';

/** @internal */
export const ON_POINTER_MOVE = 'ON_POINTER_MOVE';

/** @internal */
export const ON_MOUSE_DOWN = 'ON_MOUSE_DOWN';

/** @internal */
export const ON_MOUSE_UP = 'ON_MOUSE_UP';

/** @internal */
export const ON_MOUSE_RIGHT_CLICK = 'ON_MOUSE_RIGHT_CLICK';

interface MouseRightClickAction {
  type: typeof ON_MOUSE_RIGHT_CLICK;
  position: Point;
  time: number;
}

interface MouseDownAction {
  type: typeof ON_MOUSE_DOWN;
  position: Point;
  time: number;
}

interface MouseUpAction {
  type: typeof ON_MOUSE_UP;
  position: Point;
  time: number;
}

interface PointerMoveAction {
  type: typeof ON_POINTER_MOVE;
  position: Point;
  time: number;
}

/**
 * Action called on mouse button down event
 * @param position the x and y position (native event offsetX, offsetY)
 * @param time the timestamp of the event (native event timeStamp)
 * @internal
 */
export function onMouseRightClick(position: Point, time: number): MouseRightClickAction {
  return { type: ON_MOUSE_RIGHT_CLICK, position, time };
}

/**
 * Action called on mouse button down event
 * @param position the x and y position (native event offsetX, offsetY)
 * @param time the timestamp of the event (native event timeStamp)
 * @internal
 */
export function onMouseDown(position: Point, time: number): MouseDownAction {
  return { type: ON_MOUSE_DOWN, position, time };
}

/**
 * Action called on mouse button up event
 * @param position the x and y position (native event offsetX, offsetY)
 * @param time the timestamp of the event (native event timeStamp)
 * @internal
 */
export function onMouseUp(position: Point, time: number): MouseUpAction {
  return { type: ON_MOUSE_UP, position, time };
}

/**
 * Action called with the mouse coordinates relatives to the chart container (exclude the legend)
 * @param position the x and y position (native event offsetX, offsetY)
 * @param time the timestamp of the event (native event timeStamp)
 * @internal
 */
export function onPointerMove(position: Point, time: number): PointerMoveAction {
  return { type: ON_POINTER_MOVE, position, time };
}

/** @internal */
export type MouseActions = MouseDownAction | MouseUpAction | PointerMoveAction;
