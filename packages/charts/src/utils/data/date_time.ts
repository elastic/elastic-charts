/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import moment from 'moment-timezone';

import { TimeMs } from '../../common/geometry';

/** @internal */
export function getMomentWithTz(date: number | Date, timeZone?: string) {
  if (timeZone === 'local' || !timeZone) {
    return moment(date);
  }
  if (timeZone.toLowerCase().startsWith('utc+') || timeZone.toLowerCase().startsWith('utc-')) {
    return moment(date).utcOffset(Number(timeZone.slice(3)));
  }
  return moment.tz(date, timeZone);
}

/** @internal */
export type UnixTimestamp = TimeMs;

type CalendarIntervalUnit =
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

type FixedIntervalUnit = 'ms' | 's' | 'm' | 'h' | 'd';

const FIXED_UNIT_TO_BASE: Record<FixedIntervalUnit, TimeMs> = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
};

/** @internal */
export type CalendarInterval = {
  type: 'calendar';
  unit: CalendarIntervalUnit;
  quantity: number;
};
/** @internal */
export type FixedInterval = {
  type: 'fixed';
  unit: FixedIntervalUnit;
  quantity: number;
};
function isCalendarInterval(interval: CalendarInterval | FixedInterval): interval is CalendarInterval {
  return interval.type === 'calendar';
}

/** @internal */
export function snapDateToInterval(
  date: number | Date,
  interval: CalendarInterval | FixedInterval,
  snapTo: 'start' | 'end',
  timeZone?: string,
): UnixTimestamp {
  const momentDate = getMomentWithTz(date, timeZone);
  return isCalendarInterval(interval)
    ? calendarIntervalSnap(momentDate, interval, snapTo).valueOf()
    : fixedIntervalSnap(momentDate, interval, snapTo).valueOf();
}

function calendarIntervalSnap(date: moment.Moment, interval: CalendarInterval, snapTo: 'start' | 'end') {
  const momentUnitName = esCalendarIntervalsToMoment(interval);
  return snapTo === 'start' ? date.startOf(momentUnitName) : date.endOf(momentUnitName);
}
function fixedIntervalSnap(date: moment.Moment, interval: FixedInterval, snapTo: 'start' | 'end') {
  const unitMultiplier = interval.quantity * FIXED_UNIT_TO_BASE[interval.unit];
  const roundedDate = Math.floor(date.valueOf() / unitMultiplier) * unitMultiplier;
  return snapTo === 'start' ? roundedDate : roundedDate + unitMultiplier - 1;
}

function esCalendarIntervalsToMoment(interval: CalendarInterval): moment.unitOfTime.StartOf {
  // eslint-disable-next-line default-case
  switch (interval.unit) {
    case 'minute':
    case 'm':
      return 'minutes';
    case 'hour':
    case 'h':
      return 'hour';
    case 'day':
    case 'd':
      return 'day';
    case 'week':
    case 'w':
      return 'week';
    case 'month':
    case 'M':
      return 'month';
    case 'quarter':
    case 'q':
      return 'quarter';
    case 'year':
    case 'y':
      return 'year';
  }
}
