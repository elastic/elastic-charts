export const ON_CURSOR_POSITION_CHANGE = 'ON_CURSOR_POSITION_CHANGE';

export interface CursorPositionChangeAction {
  type: typeof ON_CURSOR_POSITION_CHANGE;
  x: number;
  y: number;
}

export function onCursorPositionChange(x: number, y: number): CursorPositionChangeAction {
  return { type: ON_CURSOR_POSITION_CHANGE, x, y };
}
