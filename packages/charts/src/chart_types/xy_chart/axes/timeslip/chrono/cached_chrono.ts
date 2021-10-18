/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { addTime, propsFromCalendarObj, CalendarUnit } from './chrono';

const timeProps = ['epochSeconds', 'dayOfWeek'];

/** @internal */
export const timeProp = Object.fromEntries(timeProps.map((propName, i) => [propName, i]));

const zonedDateTimeFromCache: Record<string, [number, number]> = {}; // without caching, even luxon is choppy with zoom and pan

interface TemporalArgs {
  timeZone: string;
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
}

/** @internal */
export const cachedZonedDateTimeFrom = (temporalArgs: TemporalArgs) => {
  const { timeZone, year, month, day, hour = 0, minute = 0, second = 0 } = temporalArgs;
  const key = `_${year}_${month}_${day}_${hour}_${minute}_${second}`;
  const cachedValue = zonedDateTimeFromCache[key];
  if (cachedValue) {
    return cachedValue;
  }
  const result = propsFromCalendarObj({ year, month, day, hour }, timeZone);
  zonedDateTimeFromCache[key] = result;
  return result;
};

const deltaTimeCache: Record<string, number> = {}; // without caching, even luxon is choppy with zoom and pan

/** @internal */
export const cachedTimeDelta = (temporalArgs: TemporalArgs, unit: CalendarUnit, count: number) => {
  const { timeZone, year, month, day, hour = 0, minute = 0, second = 0 } = temporalArgs;
  const key = `_${year}_${month}_${day}_${hour}_${minute}_${second}_${count}_${unit}`;
  const cachedValue = deltaTimeCache[key];
  if (cachedValue) {
    return cachedValue;
  }
  const result = addTime({ year, month, day }, timeZone, unit, count);
  deltaTimeCache[key] = result;
  return result;
};
