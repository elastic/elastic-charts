/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Color } from '../../common/colors';
import { SeriesKey } from '../../common/series_id';

/** @internal */
export const CLEAR_TEMPORARY_COLORS = 'CLEAR_TEMPORARY_COLORS';

/** @internal */
export const SET_TEMPORARY_COLOR = 'SET_TEMPORARY_COLOR';

/** @internal */
export const SET_PERSISTED_COLOR = 'SET_PERSISTED_COLOR';

interface ClearTemporaryColors {
  type: typeof CLEAR_TEMPORARY_COLORS;
}

interface SetTemporaryColor {
  type: typeof SET_TEMPORARY_COLOR;
  keys: SeriesKey[];
  color: Color | null;
}

interface SetPersistedColor {
  type: typeof SET_PERSISTED_COLOR;
  keys: SeriesKey[];
  color: Color | null;
}

/** @internal */
export function clearTemporaryColors(): ClearTemporaryColors {
  return { type: CLEAR_TEMPORARY_COLORS };
}

/** @internal */
export function setTemporaryColor(keys: SeriesKey[], color: Color | null): SetTemporaryColor {
  return { type: SET_TEMPORARY_COLOR, keys, color };
}

/** @internal */
export function setPersistedColor(keys: SeriesKey[], color: Color | null): SetPersistedColor {
  return { type: SET_PERSISTED_COLOR, keys, color };
}

/** @internal */
export type ColorsActions = ClearTemporaryColors | SetTemporaryColor | SetPersistedColor;
