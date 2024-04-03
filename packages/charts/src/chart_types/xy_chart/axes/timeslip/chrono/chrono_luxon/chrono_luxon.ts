/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { DateTime } from 'luxon';

/** @internal */
export interface CalendarObject {
  year: number;
  month: number;
  day: number;
  hour?: number;
}

type CalendarUnit = 'days'; // luxon has a lot of others but we don't use them here

/** @internal */
export const timeObjFromCalendarObj = (yearMonthDayHour: CalendarObject, timeZone: string) =>
  DateTime.fromObject({ ...yearMonthDayHour, zone: timeZone });
/** @internal */
export const timeObjFromEpochSeconds = (timeZone: string, seconds: number) =>
  DateTime.fromSeconds(seconds, { zone: timeZone });
/** @internal */
export const timeObjToSeconds = (t: DateTime) => t.toSeconds();
/** @internal */
export const timeObjToWeekday = (t: DateTime) => t.weekday;
/** @internal */
export const timeObjToYear = (t: DateTime) => t.year;
/** @internal */
export const addTimeToObj = (obj: DateTime, unit: CalendarUnit, count: number) => obj.plus({ [unit]: count });
