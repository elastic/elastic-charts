import { Point } from '../../utils/point';

export const ON_MOUSE_DOWN = 'ON_MOUSE_DOWN';
export const ON_MOUSE_UP = 'ON_MOUSE_UP';

export interface MouseDownAction {
  type: typeof ON_MOUSE_DOWN;
  position: Point;
  time: number;
}
export interface MouseUpAction {
  type: typeof ON_MOUSE_UP;
  position: Point;
  time: number;
}

export function onMouseDown(position: Point, time: number): MouseDownAction {
  return { type: ON_MOUSE_DOWN, position, time };
}

export function onMouseUp(position: Point, time: number): MouseUpAction {
  return { type: ON_MOUSE_UP, position, time };
}
