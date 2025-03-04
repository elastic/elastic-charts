/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { addTime, endOf, getUnixTimestamp, getUTCOffset, startOf } from './chrono';
import type { CalendarIntervalUnit, FixedIntervalUnit, UnixTimestamp } from './types';
import type { TimeMs } from '../../common/geometry';

/**
 * An [Elasticsearch Calendar interval unit](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#calendar_intervals)
 * @public
 */
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

/**
 * An [Elasticsearch fixed interval unit](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#fixed_intervals)
 * @public
 */
export type ESFixedIntervalUnit = 'ms' | 's' | 'm' | 'h' | 'd';

/** @internal */
export const ES_FIXED_INTERVAL_UNIT_TO_BASE: Record<ESFixedIntervalUnit, TimeMs> = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
};

/**
 * The definition of an [Elasticsearch Calendar interval](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#calendar_intervals)
 * @public
 */
export interface ESCalendarInterval {
  type: 'calendar';
  unit: ESCalendarIntervalUnit;
  value: number;
}

/**
 * The definition of an [Elasticsearch fixed interval](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#fixed_intervals)
 * @public
 */
export interface ESFixedInterval {
  type: 'fixed';
  unit: ESFixedIntervalUnit;
  value: number;
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

/**
 * Round a Date or unix timestamp to the beginning or end of the corresponding Elasticsearch date histogram bucket.
 * It uses the [date histogram aggregation Elasticsearch formula](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#datehistogram-aggregation-time-zone)
 * to compute the fixed interval bucket, and it uses an internal selected date/time library to compute the calendar one.
 *
 * @param date - a unix timestamp or a Date object
 * @param interval - the description of the Elasticsearch interval you want to round to
 * @param snapTo - if you want to snap the date at the `start` or at the `end` of the interval
 * @param timeZone - a IANA timezone
 * @public
 */
export function roundDateToESInterval(
  date: UnixTimestamp | Date,
  interval: ESCalendarInterval | ESFixedInterval,
  snapTo: 'start' | 'end',
  timeZone: string,
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
  timeZone: string,
): UnixTimestamp {
  const unitMultiplier = interval.value * ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit];
  const unixTimestamp = getUnixTimestamp(date, timeZone);
  const utcOffsetInMs = getUTCOffset(date, timeZone) * 60 * 1000;
  const roundedDate = Math.floor((unixTimestamp + utcOffsetInMs) / unitMultiplier) * unitMultiplier - utcOffsetInMs;
  return snapTo === 'start' ? roundedDate : roundedDate + unitMultiplier - 1;
}

/** @internal */
export function timeRange(
  from: number,
  to: number,
  interval: ESCalendarInterval | ESFixedInterval,
  timeZone: string,
): number[] {
  return interval.type === 'fixed'
    ? fixedTimeRange(from, to, interval, timeZone)
    : calendarTimeRange(from, to, interval, timeZone);
}

function calendarTimeRange(from: number, to: number, interval: ESCalendarInterval, timeZone: string): number[] {
  const snappedFrom = roundDateToESInterval(from, interval, 'start', timeZone);
  const snappedTo = roundDateToESInterval(to, interval, 'start', timeZone);
  const values: number[] = [snappedFrom];
  let current = snappedFrom;
  while (addTime(current, timeZone, esCalendarIntervalToChronoInterval[interval.unit], interval.value) < snappedTo) {
    current = addTime(current, timeZone, esCalendarIntervalToChronoInterval[interval.unit], interval.value);
    values.push(current);
  }
  return values;
}

function fixedTimeRange(from: number, to: number, interval: ESFixedInterval, timeZone: string): number[] {
  const snappedFrom = roundDateToESInterval(from, interval, 'start', timeZone);
  const snappedTo = roundDateToESInterval(to, interval, 'start', timeZone);
  const utcTo = localToUTC(snappedTo, timeZone);
  let current = localToUTC(snappedFrom, timeZone);
  const values: number[] = [current];
  while (current + interval.value * ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit] < utcTo) {
    current = current + interval.value * ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit];
    values.push(current);
  }
  // filtering duplicates that can be generated around DST
  return [...new Set(values.map((d) => utcToLocal(d, timeZone)))];
}

/** @internal */
export function addIntervalToTime(time: number, interval: ESCalendarInterval | ESFixedInterval, timeZone: string) {
  return interval.type === 'fixed'
    ? utcToLocal(localToUTC(time, timeZone) + interval.value * ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit], timeZone)
    : addTime(time, timeZone, esCalendarIntervalToChronoInterval[interval.unit], interval.value);
}

function utcToLocal(time: number, timeZone: string) {
  return time - getUTCOffset(time, timeZone) * 60 * 1000;
}
function localToUTC(time: number, timeZone: string) {
  return time + getUTCOffset(time, timeZone) * 60 * 1000;
}
