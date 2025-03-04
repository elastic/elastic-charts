/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { $Values } from 'utility-types';

import type { CalendarUnit } from './chrono';
import { addTime, propsFromCalendarObj } from './chrono';

const timeProps = ['epochSeconds', 'dayOfWeek'];

/** @internal */
export const timeProp = Object.fromEntries(timeProps.map((propName, i) => [propName, i]));

/** @public */
export const TimeProp = Object.freeze({
  EpochSeconds: 0 as const,
  DayOfWeek: 1 as const,
});
/** @public */
export type TimeProp = $Values<typeof TimeProp>;

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
  const { timeZone, year, month, day, hour = 0 } = temporalArgs;
  const key = `_${year}_${month}_${day}_${hour}_${timeZone}`;
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
  const { timeZone, year, month, day } = temporalArgs;
  const key = `_${year}_${month}_${day}_${timeZone}_${count}_${unit}`;
  const cachedValue = deltaTimeCache[key];
  if (cachedValue) {
    return cachedValue;
  }
  const result = addTime({ year, month, day }, timeZone, unit, count);
  deltaTimeCache[key] = result;
  return result;
};
