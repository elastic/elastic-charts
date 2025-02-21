/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import moment from 'moment-timezone';

import type { CalendarIntervalUnit, CalendarObj, DateTime, FixedIntervalUnit, Minutes, UnixTimestamp } from './types';

/** @internal */
export const timeObjFromCalendarObj = (
  yearMonthDayHour: Partial<CalendarObj>,
  timeZone: string = 'browser',
): moment.Moment =>
  timeZone
    ? moment.tz(
        {
          ...yearMonthDayHour,
          month: typeof yearMonthDayHour.month === 'number' ? yearMonthDayHour.month - 1 : undefined,
        },
        timeZone,
      )
    : moment({
        ...yearMonthDayHour,
        month: typeof yearMonthDayHour.month === 'number' ? yearMonthDayHour.month - 1 : undefined,
      });

/** @internal */
export const timeObjFromUnixTimestamp = (unixTimestamp: UnixTimestamp, timeZone?: string): moment.Moment =>
  timeZone ? moment.tz(unixTimestamp, timeZone) : moment(unixTimestamp);

/** @internal */
export const timeObjFromDate = (date: Date, timeZone?: string): moment.Moment =>
  timeZone ? moment.tz(date, timeZone) : moment(date);

/** @internal */
export const timeObjFromAny = (time: DateTime, timeZone?: string): moment.Moment => {
  return typeof time === 'number'
    ? timeObjFromUnixTimestamp(time, timeZone)
    : time instanceof Date
      ? timeObjFromDate(time, timeZone)
      : timeObjFromCalendarObj(time, timeZone);
};

/** @internal */
export const timeObjToSeconds = (t: moment.Moment) => t.unix();
/** @internal */
export const timeObjToUnixTimestamp = (t: moment.Moment): UnixTimestamp => t.valueOf();
/** @internal */
export const timeObjToWeekday = (t: moment.Moment) => t.isoWeekday();
/** @internal */
export const timeObjToYear = (t: moment.Moment) => t.year();
/** @internal */
export const addTimeToObj = (obj: moment.Moment, unit: CalendarIntervalUnit | FixedIntervalUnit, count: number) =>
  obj.add(count, unit);
/** @internal */
export const subtractTimeToObj = (obj: moment.Moment, unit: CalendarIntervalUnit | FixedIntervalUnit, count: number) =>
  obj.subtract(count, unit);
/** @internal */
export const startTimeOfObj = (obj: moment.Moment, unit: CalendarIntervalUnit | FixedIntervalUnit) =>
  obj.startOf(unit === 'week' ? 'isoWeek' : unit); // we should use the ISO week to align to ES

/** @internal */
export const endTimeOfObj = (obj: moment.Moment, unit: CalendarIntervalUnit | FixedIntervalUnit) =>
  obj.endOf(unit === 'week' ? 'isoWeek' : unit); // we should use the ISO week to align to ES

/** @internal */
export const timeObjToUTCOffset = (obj: moment.Moment): Minutes => obj.utcOffset();

/** @internal */
export const formatTimeObj = (obj: moment.Moment, format: string): string => obj.format(format);

/** @internal */
export const diffTimeObjs = (
  obj1: moment.Moment,
  obj2: moment.Moment,
  unit: CalendarIntervalUnit | FixedIntervalUnit,
): number => obj1.diff(obj2, unit);

/** @internal */
export const TOKENS = {
  year: 'Y',
  year2DGT: 'YY',
  year4DGT: 'YYYY',
  monthNPD: 'M',
  monthORD: 'Mo',
  monthPD: 'MM',
  monthAbr: 'MMM',
  monthFull: 'MMMM',
  dayOfMonthNP: 'D',
  dayOfMonthORD: 'Do',
  dayOfMonthPD: 'DD',
  dayOfYNP: 'DDD',
  dayOfYORD: 'DDDo',
  dayOfYPD: 'DDDD',
};
