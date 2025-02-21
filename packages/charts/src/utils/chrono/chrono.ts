/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// NOTE: to switch implementation just change the imported file (moment,luxon)
import {
  addTimeToObj,
  timeObjToUnixTimestamp,
  startTimeOfObj,
  endTimeOfObj,
  timeObjFromAny,
  timeObjToUTCOffset,
  subtractTimeToObj,
  formatTimeObj,
  diffTimeObjs,
} from './moment';
import type { CalendarIntervalUnit, DateTime, FixedIntervalUnit, Minutes, UnixTimestamp } from './types';

/** @internal */
export function addTime(
  dateTime: DateTime,
  timeZone: string | undefined,
  unit: CalendarIntervalUnit | FixedIntervalUnit,
  count: number,
): UnixTimestamp {
  return timeObjToUnixTimestamp(addTimeToObj(getTimeObj(dateTime, timeZone), unit, count));
}

/** @internal */
export function subtractTime(
  dateTime: DateTime,
  timeZone: string | undefined,
  unit: CalendarIntervalUnit | FixedIntervalUnit,
  count: number,
): UnixTimestamp {
  return timeObjToUnixTimestamp(subtractTimeToObj(getTimeObj(dateTime, timeZone), unit, count));
}

/** @internal */
export function getUnixTimestamp(dateTime: DateTime, timeZone?: string): UnixTimestamp {
  return timeObjToUnixTimestamp(getTimeObj(dateTime, timeZone));
}

/** @internal */
export function startOf(
  dateTime: DateTime,
  timeZone: string | undefined,
  unit: CalendarIntervalUnit | FixedIntervalUnit,
): UnixTimestamp {
  return timeObjToUnixTimestamp(startTimeOfObj(getTimeObj(dateTime, timeZone), unit));
}

/** @internal */
export function endOf(
  dateTime: DateTime,
  timeZone: string | undefined,
  unit: CalendarIntervalUnit | FixedIntervalUnit,
): UnixTimestamp {
  return timeObjToUnixTimestamp(endTimeOfObj(getTimeObj(dateTime, timeZone), unit));
}

function getTimeObj(dateTime: DateTime, timeZone?: string) {
  return timeObjFromAny(dateTime, timeZone);
}

/** @internal */
export function getUTCOffset(dateTime: DateTime, timeZone?: string): Minutes {
  return timeObjToUTCOffset(getTimeObj(dateTime, timeZone));
}

/** @internal */
export function formatTime(dateTime: DateTime, timeZone: string | undefined, format: string) {
  return formatTimeObj(getTimeObj(dateTime, timeZone), format);
}

/** @internal */
export function diff(
  dateTime1: DateTime,
  timeZone1: string | undefined,
  dateTime2: DateTime,
  timeZone2: string | undefined,
  unit: CalendarIntervalUnit | FixedIntervalUnit,
) {
  return diffTimeObjs(getTimeObj(dateTime1, timeZone1), getTimeObj(dateTime2, timeZone2), unit);
}
