/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { TimeMs } from '../../common/geometry';

/** @internal */
export interface CalendarObj {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

/** @internal */
export type CalendarIntervalUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

/** @internal */
export type FixedIntervalUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day';

/**
 * It represents the number of milliseconds between 1 January 1970 00:00:00 UTC and the identified date/time.
 * @public
 */
export type UnixTimestamp = TimeMs;

/** @internal */
export type Minutes = number;

/** @internal */
export type DateTime = Partial<CalendarObj> | UnixTimestamp | Date;
