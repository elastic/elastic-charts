/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { createAction } from '@reduxjs/toolkit';

import type { Color } from '../../common/colors';
import type { SeriesKey } from '../../common/series_id';

interface SetTemporaryColor {
  keys: SeriesKey[];
  color: Color | null;
}

interface SetPersistedColor {
  keys: SeriesKey[];
  color: Color | null;
}

/** @internal */
export const clearTemporaryColors = createAction('CLEAR_TEMPORARY_COLORS');

/** @internal */
export const setTemporaryColor = createAction<SetTemporaryColor>('SET_TEMPORARY_COLOR');

/** @internal */
export const setPersistedColor = createAction<SetPersistedColor>('SET_PERSISTED_COLOR');
