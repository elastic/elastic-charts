/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { DateTime as LuxonDateTime } from 'luxon';

import { CalendarIntervalUnit, CalendarObj, DateTime, FixedIntervalUnit, Minutes, UnixTimestamp } from './types';

/** @internal */
export const timeObjFromCalendarObj = (
  yearMonthDayHour: Partial<CalendarObj>,
  timeZone: string = 'local',
): LuxonDateTime => LuxonDateTime.fromObject({ ...yearMonthDayHour, zone: timeZone });
/** @internal */
export const timeObjFromUnixTimestamp = (unixTimestamp: UnixTimestamp, timeZone: string = 'local'): LuxonDateTime =>
  LuxonDateTime.fromMillis(unixTimestamp, { zone: timeZone });

/** @internal */
export const timeObjFromDate = (date: Date, timeZone: string = 'local'): LuxonDateTime =>
  LuxonDateTime.fromJSDate(date, { zone: timeZone });

/** @internal */
export const timeObjFromAny = (time: DateTime, timeZone: string = 'local'): LuxonDateTime => {
  return typeof time === 'number'
    ? timeObjFromUnixTimestamp(time, timeZone)
    : time instanceof Date
      ? timeObjFromDate(time, timeZone)
      : timeObjFromCalendarObj(time, timeZone);
};

/** @internal */
export const timeObjToSeconds = (t: LuxonDateTime) => t.toSeconds();
/** @internal */
export const timeObjToUnixTimestamp = (t: LuxonDateTime): UnixTimestamp => t.toMillis();
/** @internal */
export const timeObjToWeekday = (t: LuxonDateTime) => t.weekday;
/** @internal */
export const timeObjToYear = (t: LuxonDateTime) => t.year;
/** @internal */
export const addTimeToObj = (obj: LuxonDateTime, unit: CalendarIntervalUnit | FixedIntervalUnit, count: number) =>
  obj.plus({ [unit]: count });

/** @internal */
export const subtractTimeToObj = (obj: LuxonDateTime, unit: CalendarIntervalUnit | FixedIntervalUnit, count: number) =>
  obj.minus({ [unit]: count });

/** @internal */
export const startTimeOfObj = (obj: LuxonDateTime, unit: CalendarIntervalUnit | FixedIntervalUnit) => obj.startOf(unit);

/** @internal */
export const endTimeOfObj = (obj: LuxonDateTime, unit: CalendarIntervalUnit | FixedIntervalUnit) => obj.endOf(unit);

/** @internal */
export const timeObjToUTCOffset = (obj: LuxonDateTime): Minutes => obj.offset;

/** @internal */
export const formatTimeObj = (obj: LuxonDateTime, format: string): string => obj.toFormat(format);

/** @internal */
export const diffTimeObjs = (
  obj1: LuxonDateTime,
  obj2: LuxonDateTime,
  unit: CalendarIntervalUnit | FixedIntervalUnit,
): number => obj1.diff(obj2, unit).as(unit);
