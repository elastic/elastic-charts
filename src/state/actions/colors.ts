import { SeriesKey } from '../../chart_types/xy_chart/utils/series';

export const CLEAR_TEMPORARY_COLORS = 'CLEAR_TEMPORARY_COLORS';
export const SET_TEMPORARY_COLOR = 'SET_TEMPORARY_COLOR';
export const SET_PERSISTED_COLOR = 'SET_PERSISTED_COLOR';

interface ClearTemporaryColors {
  type: typeof CLEAR_TEMPORARY_COLORS;
}

interface SetTemporaryColor {
  type: typeof SET_TEMPORARY_COLOR;
  key: SeriesKey;
  color: string;
}

interface SetPersistedColor {
  type: typeof SET_PERSISTED_COLOR;
  key: SeriesKey;
  color: string;
}

export function clearTemporaryColors(): ClearTemporaryColors {
  return { type: CLEAR_TEMPORARY_COLORS };
}

export function setTemporaryColor(key: SeriesKey, color: string): SetTemporaryColor {
  return { type: SET_TEMPORARY_COLOR, key, color };
}

export function setPersistedColor(key: SeriesKey, color: string): SetPersistedColor {
  return { type: SET_PERSISTED_COLOR, key, color };
}

export type ColorsActions = ClearTemporaryColors | SetTemporaryColor | SetPersistedColor;
