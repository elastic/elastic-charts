/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  addTimeToObj,
  CalendarObject,
  timeObjFromCalendarObj,
  timeObjFromEpochSeconds,
  timeObjToSeconds,
  timeObjToWeekday,
  timeObjToYear,
} from './chrono_luxon/chrono_luxon';
//from './chrono-moment/chrono-moment'
//from './chrono-proposal-temporal/chrono-proposal-temporal'

/** @internal */
export type CalendarUnit = 'days'; // luxon has a lot of others but we don't use them here

/**
 * library independent part
 * @internal
 */
export const propsFromCalendarObj = (calendarObj: CalendarObject, timeZone: string): [number, number] => {
  const t = timeObjFromCalendarObj(calendarObj, timeZone);
  return [timeObjToSeconds(t), timeObjToWeekday(t)];
};

/** @internal */
export const epochInSecondsToYear = (timeZone: string, seconds: number) =>
  timeObjToYear(timeObjFromEpochSeconds(timeZone, seconds));

/** @internal */
export const epochDaysInMonth = (timeZone: string, seconds: number) =>
  timeObjFromEpochSeconds(timeZone, seconds).daysInMonth;

/** @internal */
export const addTime = (calendarObj: CalendarObject, timeZone: string, unit: CalendarUnit, count: number) =>
  timeObjToSeconds(addTimeToObj(timeObjFromCalendarObj(calendarObj, timeZone), unit, count));
