/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Calendar arithmetic in a time zone, on `Intl.DateTimeFormat`: the engine's own time zone data, the same that
 * says whether a time zone is valid.
 *
 * A local time that the zone's clocks show twice is the earlier of the two, and one that they skip is as far
 * after the skip as it was into it: what `Temporal` calls the compatible choice. A day that the calendar does
 * not have, such as April 31, is no time: its numbers are `NaN`, which the rasters of the axis count on when
 * they go through the days of a month up to 31.
 */

/** @internal */
export interface CalendarObject {
  year: number;
  month: number;
  day: number;
  hour?: number;
}

type CalendarUnit = 'days';

/** A moment in a time zone: what a clock and a calendar there show at it */
interface ZonedTime {
  timeZone: string;
  epochMs: number;
  /** the moment at which UTC clocks show what the clocks of the zone show at this one */
  shownAsUtc: number;
  year: number;
  month: number;
  /** ISO weekday, 1 is Monday and 7 is Sunday */
  weekday: number;
  daysInMonth: number;
}

const DAY_MS = 86_400_000;

/** One formatter for each time zone that was asked about: making a formatter costs more than a hundred uses */
const formatters = new Map<string, Intl.DateTimeFormat>();

/** What the clocks of the zone show at a moment, as the moment at which UTC clocks show the same */
function localAsUtc(timeZone: string, epochMs: number): number {
  if (!Number.isFinite(epochMs)) return NaN;
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatters.set(timeZone, formatter);
  }
  const shown = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0 };
  for (const { type, value } of formatter.formatToParts(epochMs)) {
    if (type in shown) shown[type as keyof typeof shown] = Number(value);
  }
  return Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute, shown.second);
}

/** How far the clocks of the zone are ahead of UTC at a moment */
const offsetMs = (timeZone: string, epochMs: number) =>
  localAsUtc(timeZone, epochMs) - Math.floor(epochMs / 1000) * 1000;

const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

function zonedTime(timeZone: string, epochMs: number, shownAsUtc: number): ZonedTime {
  const shown = new Date(shownAsUtc);
  const [year, month] = [shown.getUTCFullYear(), shown.getUTCMonth() + 1];
  return {
    timeZone,
    epochMs,
    shownAsUtc,
    year,
    month,
    weekday: ((shown.getUTCDay() + 6) % 7) + 1,
    daysInMonth: daysInMonth(year, month),
  };
}

/** The moment at which the clocks of the zone show what UTC clocks show at another */
function timeShowing(timeZone: string, shownAsUtc: number): ZonedTime {
  if (!Number.isFinite(shownAsUtc)) return zonedTime(timeZone, NaN, NaN);
  // the offset of a day earlier holds, unless the clocks were changed since
  const offsetBefore = offsetMs(timeZone, shownAsUtc - DAY_MS);
  const first = shownAsUtc - offsetBefore;
  const offsetAtFirst = offsetMs(timeZone, first);
  if (offsetAtFirst === offsetBefore) return zonedTime(timeZone, first, shownAsUtc);
  const second = shownAsUtc - offsetAtFirst;
  if (offsetMs(timeZone, second) === offsetAtFirst) return zonedTime(timeZone, second, shownAsUtc);
  // the clocks skip this time
  return zonedTime(timeZone, first, first + offsetAtFirst);
}

/** @internal */
export const timeObjFromCalendarObj = ({ year, month, day, hour = 0 }: CalendarObject, timeZone: string): ZonedTime =>
  month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month)
    ? timeShowing(timeZone, Date.UTC(year, month - 1, day, hour))
    : zonedTime(timeZone, NaN, NaN);

/** @internal */
export const timeObjFromEpochSeconds = (timeZone: string, seconds: number): ZonedTime =>
  zonedTime(timeZone, seconds * 1000, localAsUtc(timeZone, seconds * 1000));

/** @internal */
export const timeObjToSeconds = (t: ZonedTime) => t.epochMs / 1000;

/** @internal */
export const timeObjToWeekday = (t: ZonedTime) => t.weekday;

/** @internal */
export const timeObjToYear = (t: ZonedTime) => t.year;

/**
 * The same time of the day, a number of days later by the calendar of the zone
 * @internal
 */
export const addTimeToObj = (t: ZonedTime, unit: CalendarUnit, count: number) =>
  timeShowing(t.timeZone, t.shownAsUtc + count * DAY_MS);
