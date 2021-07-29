/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { TimeMs } from '../../common/geometry';
import { endOf, getUnixTimestamp, startOf } from './chrono';
import { CalendarIntervalUnit, FixedIntervalUnit, UnixTimestamp } from './types';

/** @internal */
export type ESCalendarIntervalUnit =
  | 'minute'
  | 'm'
  | 'hour'
  | 'h'
  | 'day'
  | 'd'
  | 'week'
  | 'w'
  | 'month'
  | 'M'
  | 'quarter'
  | 'q'
  | 'year'
  | 'y';

type ESFixedIntervalUnit = 'ms' | 's' | 'm' | 'h' | 'd';

/** @internal */
export const ES_FIXED_INTERVAL_UNIT_TO_BASE: Record<ESFixedIntervalUnit, TimeMs> = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
};

/** @internal */
export type ESCalendarInterval = {
  type: 'calendar';
  unit: ESCalendarIntervalUnit;
  quantity: number;
};

/** @internal */
export interface ESFixedInterval {
  type: 'fixed';
  unit: ESFixedIntervalUnit;
  quantity: number;
}

const esCalendarIntervalToChronoInterval: Record<ESCalendarIntervalUnit, CalendarIntervalUnit | FixedIntervalUnit> = {
  minute: 'minute',
  m: 'minute',
  hour: 'hour',
  h: 'hour',
  day: 'day',
  d: 'day',
  week: 'week',
  w: 'week',
  month: 'month',
  M: 'month',
  quarter: 'quarter',
  q: 'quarter',
  year: 'year',
  y: 'year',
};

/** @internal */
export function snapDateToESInterval(
  date: number | Date,
  interval: ESCalendarInterval | ESFixedInterval,
  snapTo: 'start' | 'end',
  timeZone?: string,
): UnixTimestamp {
  return isCalendarInterval(interval)
    ? esCalendarIntervalSnap(date, interval, snapTo, timeZone)
    : esFixedIntervalSnap(date, interval, snapTo, timeZone);
}

function isCalendarInterval(interval: ESCalendarInterval | ESFixedInterval): interval is ESCalendarInterval {
  return interval.type === 'calendar';
}

function esCalendarIntervalSnap(
  date: number | Date,
  interval: ESCalendarInterval,
  snapTo: 'start' | 'end',
  timeZone?: string,
) {
  return snapTo === 'start'
    ? startOf(date, timeZone, esCalendarIntervalToChronoInterval[interval.unit])
    : endOf(date, timeZone, esCalendarIntervalToChronoInterval[interval.unit]);
}

function esFixedIntervalSnap(
  date: number | Date,
  interval: ESFixedInterval,
  snapTo: 'start' | 'end',
  timeZone?: string,
): UnixTimestamp {
  const unitMultiplier = interval.quantity * ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit];
  const unixTimestamp = getUnixTimestamp(date, timeZone);
  const roundedDate = Math.floor(unixTimestamp / unitMultiplier) * unitMultiplier;
  return snapTo === 'start' ? roundedDate : roundedDate + unitMultiplier - 1;
}
