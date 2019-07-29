export const ON_MOUSE_DOWN = 'ON_MOUSE_DOWN';
export const ON_MOUSE_UP = 'ON_MOUSE_UP';

export interface MouseDownAction {
  type: typeof ON_MOUSE_DOWN;
  point: {
    x: number;
    y: number;
  };
}
export interface MouseUpAction {
  type: typeof ON_MOUSE_UP;
}

export function onMouseDown(point: { x: number; y: number }): MouseDownAction {
  return { type: ON_MOUSE_DOWN, point };
}

export function onMouseUp(): MouseUpAction {
  return { type: ON_MOUSE_UP };
}
