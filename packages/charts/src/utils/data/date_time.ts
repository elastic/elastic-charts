/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { unitOfTime } from 'moment';
import moment from 'moment-timezone';

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
export type UnixTimestamp = number;

/** @internal */
export function snapDateToInterval(
  date: number | Date,
  interval: 'calendar' | 'fixed',
  unit: string,
  snapTo: 'start' | 'end',
  timeZone?: string,
): UnixTimestamp {
  const momentDate = getMomentWithTz(date, timeZone);

  return interval === 'calendar'
    ? calendarIntervalSnap(momentDate, unit, snapTo).valueOf()
    : fixedIntervalSnap(momentDate, unit, snapTo).valueOf();
}

function calendarIntervalSnap(date: moment.Moment, unit: string, snapTo: 'start' | 'end') {
  const momentUnitName = esCalendarIntervalsToMoment(unit);
  if (!momentUnitName) {
    return date;
  }
  return snapTo === 'start' ? date.startOf(momentUnitName) : date.endOf(momentUnitName);
}
function fixedIntervalSnap(date: moment.Moment, unit: string, snapTo: 'start' | 'end') {
  const unitMultiplier = esFixedIntervalsToMomentUnit(unit);
  if (isNaN(unitMultiplier)) {
    return date;
  }

  const roundedDate = Math.floor(date.valueOf() / unitMultiplier) * unitMultiplier;
  return snapTo === 'start' ? roundedDate : roundedDate + unitMultiplier - 1;
}

function esFixedIntervalsToMomentUnit(unit: string): number {
  if (unit.endsWith('ms')) {
    return getNumericalUnit(unit, 'ms');
  }
  if (unit.endsWith('s')) {
    return getNumericalUnit(unit, 's') * 1000;
  }
  if (unit.endsWith('m')) {
    return getNumericalUnit(unit, 'm') * 1000 * 60;
  }
  if (unit.endsWith('h')) {
    return getNumericalUnit(unit, 'h') * 1000 * 60 * 60;
  }
  if (unit.endsWith('d')) {
    return getNumericalUnit(unit, 'd') * 1000 * 60 * 60 * 24;
  }
  return NaN;
}

function getNumericalUnit(unit: string, intervalLabel: string) {
  return Number.parseFloat(unit.slice(0, unit.indexOf(intervalLabel)));
}

function esCalendarIntervalsToMoment(unit: string): unitOfTime.StartOf | undefined {
  if (unit === 'minute' || unit === '1m') {
    return 'minutes';
  }
  if (unit === 'hour' || unit === '1h') {
    return 'hour';
  }
  if (unit === 'day' || unit === '1d') {
    return 'day';
  }
  if (unit === 'week' || unit === '1w') {
    return 'week';
  }
  if (unit === 'month' || unit === '1M') {
    return 'month';
  }
  if (unit === 'quarter' || unit === '1q') {
    return 'quarter';
  }
  if (unit === 'year' || unit === '1y') {
    return 'year';
  }
}
