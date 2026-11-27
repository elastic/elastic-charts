/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { addTime, epochDaysInMonth, epochInSecondsToYear, propsFromCalendarObj } from './chrono';

const HOUR = 3600;
const at = (iso: string) => Date.parse(iso) / 1000;

describe('calendar arithmetic in a time zone', () => {
  it.each<[string, number, number, number, number, string, number]>([
    ['UTC', 2024, 2, 29, 0, '2024-02-29T00:00Z', 4],
    ['Asia/Kolkata', 2024, 1, 1, 0, '2023-12-31T18:30Z', 1],
    ['Asia/Kathmandu', 2024, 1, 1, 0, '2023-12-31T18:15Z', 1],
    ['Australia/Lord_Howe', 2024, 4, 7, 1, '2024-04-06T14:00Z', 7],
    ['Europe/Zurich', 2023, 10, 29, 3, '2023-10-29T02:00Z', 7],
  ])('in %s, %i-%i-%i at %i h is %s, weekday %i', (timeZone, year, month, day, hour, utc, weekday) => {
    expect(propsFromCalendarObj({ year, month, day, hour }, timeZone)).toEqual([at(utc), weekday]);
  });

  it('takes the earlier of the two times that the clocks show twice', () => {
    expect(propsFromCalendarObj({ year: 2023, month: 10, day: 29, hour: 2 }, 'Europe/Zurich')[0]).toBe(
      at('2023-10-29T00:00Z'),
    );
    expect(propsFromCalendarObj({ year: 2024, month: 11, day: 3, hour: 1 }, 'America/New_York')[0]).toBe(
      at('2024-11-03T05:00Z'),
    );
  });

  it('moves a time that the clocks skip to after the skip', () => {
    // 02:00 does not exist: the clocks go from 02:00 to 03:00
    expect(propsFromCalendarObj({ year: 2023, month: 3, day: 26, hour: 2 }, 'Europe/Zurich')[0]).toBe(
      at('2023-03-26T01:00Z'),
    );
    // midnight does not exist, in a zone whose rule is of 2023
    expect(propsFromCalendarObj({ year: 2023, month: 4, day: 28 }, 'Africa/Cairo')[0]).toBe(at('2023-04-27T22:00Z'));
    expect(propsFromCalendarObj({ year: 2018, month: 11, day: 4 }, 'America/Sao_Paulo')[0]).toBe(
      at('2018-11-04T03:00Z'),
    );
    // the whole day does not exist: the zone went across the date line
    expect(propsFromCalendarObj({ year: 2011, month: 12, day: 30 }, 'Pacific/Apia')).toEqual([
      at('2011-12-30T10:00Z'),
      6,
    ]);
  });

  it('tells the year and the days of the month by the calendar of the zone', () => {
    const newYearInUtc = at('2024-01-01T00:30Z');
    expect(epochInSecondsToYear('America/New_York', newYearInUtc)).toBe(2023);
    expect(epochInSecondsToYear('Asia/Tokyo', newYearInUtc)).toBe(2024);
    expect(epochDaysInMonth('UTC', at('2024-02-15T00:00Z'))).toBe(29);
    expect(epochDaysInMonth('UTC', at('2023-02-15T00:00Z'))).toBe(28);
    // already March in Tokyo
    expect(epochDaysInMonth('America/New_York', at('2024-02-29T20:00Z'))).toBe(29);
    expect(epochDaysInMonth('Asia/Tokyo', at('2024-02-29T20:00Z'))).toBe(31);
  });

  it('adds days by the calendar: a day is as long as the clocks of the zone make it', () => {
    const zurich = (day: number, count: number) =>
      addTime({ year: 2023, month: 3, day }, 'Europe/Zurich', 'days', count) -
      propsFromCalendarObj({ year: 2023, month: 3, day }, 'Europe/Zurich')[0];
    expect(zurich(25, 1)).toBe(24 * HOUR);
    expect(zurich(26, 1)).toBe(23 * HOUR);
    expect(zurich(20, 7)).toBe((7 * 24 - 1) * HOUR);
    expect(addTime({ year: 2023, month: 12, day: 28 }, 'Europe/Zurich', 'days', 7)).toBe(at('2024-01-03T23:00Z'));
    expect(addTime({ year: 2024, month: 3, day: 1 }, 'UTC', 'days', -1)).toBe(at('2024-02-29T00:00Z'));
    // midnight was skipped by 16 minutes and 8 seconds: a day later the clocks show what they showed after the skip
    expect(propsFromCalendarObj({ year: 1912, month: 1, day: 1 }, 'Africa/Abidjan')[0]).toBe(
      at('1912-01-01T00:16:08Z'),
    );
    expect(addTime({ year: 1912, month: 1, day: 1 }, 'Africa/Abidjan', 'days', 1)).toBe(at('1912-01-02T00:16:08Z'));
  });

  it('has no time for a day that the month does not have, which the rasters of the axis go through', () => {
    for (let day = 1; day <= 31; day++) {
      const [seconds] = propsFromCalendarObj({ year: 2023, month: 4, day }, 'Europe/Zurich');
      const nextDay = addTime({ year: 2023, month: 4, day }, 'Europe/Zurich', 'days', 1);
      expect([day, Number.isFinite(seconds), Number.isFinite(nextDay)]).toEqual([day, day <= 30, day <= 30]);
    }
    expect(propsFromCalendarObj({ year: 2024, month: 2, day: 29 }, 'UTC')[0]).toBe(at('2024-02-29T00:00Z'));
    expect(propsFromCalendarObj({ year: 2023, month: 2, day: 29 }, 'UTC')[0]).toBeNaN();
  });
});
