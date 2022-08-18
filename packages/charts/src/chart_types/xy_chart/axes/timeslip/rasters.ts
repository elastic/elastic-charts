/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/unbound-method */

import { cachedTimeDelta, cachedZonedDateTimeFrom, timeProp } from './chrono/cached_chrono';
import { epochInSecondsToYear } from './chrono/chrono';

// utils
const approxWidthsInSeconds: Record<string, number> = {
  year: 365.25 * 24 * 60 * 60,
  month: (365.25 * 24 * 60 * 60) / 12,
  week: 7 * 24 * 60 * 60,
  day: 24 * 60 * 60,
  hour: 60 * 60,
  minute: 60,
  second: 1,
  millisecond: 0.001,
};

/** @public */
export interface TimeBin {
  timePointSec: number;
  nextTimePointSec: number;
}

type TimeBinGenerator<T extends TimeBin> = (domainFrom: number, domainTo: number) => Generator<T, void> | T[];

/** @internal */
export interface TimeRaster<T extends TimeBin> {
  unit: string;
  unitMultiplier: number;
  labeled: boolean;
  minimumTickPixelDistance: number;
  binStarts: TimeBinGenerator<T>;
  detailedLabelFormat: (time: number) => string;
  minorTickLabelFormat: (time: number) => string;
  minimumPixelsPerSecond: number;
  approxWidthInMs: number;
}

interface RasterConfig {
  minimumTickPixelDistance: number;
  locale: string;
  /*
  defaultFontColor: string;
  weekendFontColor: string;
  offHourFontColor: string;
  workHourMin: number;
  workHourMax: number;
  */
}

const millisecondBinStarts = (rasterMs: number): TimeBinGenerator<TimeBin> =>
  function* (domainFrom, domainTo) {
    for (let t = Math.floor((domainFrom * 1000) / rasterMs); t < Math.ceil((domainTo * 1000) / rasterMs); t++) {
      const timePointSec = (t * rasterMs) / 1000;
      yield {
        timePointSec,
        nextTimePointSec: timePointSec + rasterMs / 1000,
      };
    }
  };

interface YearToDay {
  year: number;
  month: number;
  dayOfMonth: number;
  dayOfWeek: number;
  // fontColor: string | undefined;
}

interface YearToHour extends YearToDay {
  hour: number;
}

const hourCycle = 'h23';

const hourFormat: Partial<ConstructorParameters<typeof Intl.DateTimeFormat>[1]> = {
  hour: '2-digit',
  minute: '2-digit',
  // this is mutual exclusive with `hour12` and
  // fix the issue of rendering the time from midnight starting at 24:00 to 24:59 to 01:00
  hourCycle,
};

const englishOrdinalEndings = {
  zero: 'th',
  one: 'st',
  two: 'nd',
  few: 'rd',
  many: 'th',
  other: 'th',
};
const englishPluralRules = new Intl.PluralRules('en-US', { type: 'ordinal' });
const englishOrdinalEnding = (signedNumber: number) => englishOrdinalEndings[englishPluralRules.select(signedNumber)];

/** @internal */
export const rasters = ({ minimumTickPixelDistance, locale }: RasterConfig, timeZone: string) => {
  const minorDayBaseFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone }).format;
  const minorDayFormat = (d: number) => {
    const numberString = minorDayBaseFormat(d);
    const number = Number.parseInt(numberString, 10);
    return locale.substr(0, 2) === 'en' ? `${numberString}${englishOrdinalEnding(number)}` : numberString;
  };
  const detailedDayFormat = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone,
  }).format;

  const detailedHourFormatBase = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...hourFormat,
    timeZone,
  }).format;
  const detailedHourFormat = (d: number) => `${detailedHourFormatBase(d)}h`;

  const years: TimeRaster<TimeBin & { year: number }> = {
    unit: 'year',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
    binStarts: function* (domainFrom, domainTo) {
      const fromYear = epochInSecondsToYear(timeZone, domainFrom);
      const toYear = epochInSecondsToYear(timeZone, domainTo);
      for (let year = fromYear; year <= toYear; year++) {
        const timePoint = cachedZonedDateTimeFrom({ timeZone, year, month: 1, day: 1 });
        const timePointSec = timePoint[timeProp.epochSeconds];
        const nextTimePointSec = cachedZonedDateTimeFrom({
          timeZone,
          year: year + 1,
          month: 1,
          day: 1,
        })[timeProp.epochSeconds];
        yield { year, timePointSec, nextTimePointSec };
      }
    },
    detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format,
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const unlabeledGridMinimumPixelDistance = minimumTickPixelDistance / 1.618;
  const yearsUnlabelled: TimeRaster<TimeBin & { year: number }> = {
    ...years,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const decades: TimeRaster<TimeBin & { year: number }> = {
    unit: 'year',
    unitMultiplier: 10,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
    binStarts: function* (domainFrom, domainTo) {
      const fromYear = epochInSecondsToYear(timeZone, domainFrom);
      const toYear = epochInSecondsToYear(timeZone, domainTo);
      for (let year = Math.floor(fromYear / 10) * 10; year <= Math.ceil(toYear / 10) * 10; year += 10) {
        const timePoint = cachedZonedDateTimeFrom({ timeZone, year, month: 1, day: 1 });
        const timePointSec = timePoint[timeProp.epochSeconds];
        const nextTimePointSec = cachedZonedDateTimeFrom({
          timeZone,
          year: year + 10,
          month: 1,
          day: 1,
        })[timeProp.epochSeconds];
        yield { year, timePointSec, nextTimePointSec };
      }
    },
    detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format,
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const decadesUnlabelled: TimeRaster<TimeBin & { year: number }> = {
    ...decades,
    labeled: false,
    minimumTickPixelDistance: 1, // it should change if we ever add centuries and millennia
  };
  const months: TimeRaster<TimeBin & { year: number; month: number }> = {
    unit: 'month',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 3.6, // wow some Greek names are long
    binStarts: function* (domainFrom, domainTo) {
      for (const { year } of years.binStarts(domainFrom, domainTo)) {
        for (let month = 1; month <= 12; month++) {
          const timePoint = cachedZonedDateTimeFrom({ timeZone, year, month, day: 1 });
          const timePointSec = timePoint[timeProp.epochSeconds];
          const nextTimePointSec = cachedZonedDateTimeFrom({
            timeZone,
            year: month < 12 ? year : year + 1,
            month: (month % 12) + 1,
            day: 1,
          })[timeProp.epochSeconds];
          yield { year, month, timePointSec, nextTimePointSec };
        }
      }
    },
    detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone }).format,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'long', timeZone }).format,
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const shortMonths = {
    ...months,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'short', timeZone }).format,
    minimumTickPixelDistance: minimumTickPixelDistance * 2,
  };
  const narrowMonths = {
    ...months,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'narrow', timeZone }).format,
    minimumTickPixelDistance,
  };
  const days: TimeRaster<TimeBin & YearToDay> = {
    unit: 'day',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
    binStarts: function* (domainFrom, domainTo) {
      for (const { year, month } of months.binStarts(domainFrom, domainTo)) {
        for (let dayOfMonth = 1; dayOfMonth <= 31; dayOfMonth++) {
          const temporalArgs = {
            timeZone,
            year,
            month,
            day: dayOfMonth,
          };
          const timePoint = cachedZonedDateTimeFrom(temporalArgs);
          const dayOfWeek: number = timePoint[timeProp.dayOfWeek];
          const timePointSec = timePoint[timeProp.epochSeconds];
          const nextTimePointSec = cachedTimeDelta(temporalArgs, 'days', 1);
          if (Number.isFinite(timePointSec) && Number.isFinite(nextTimePointSec))
            yield {
              year,
              month,
              dayOfMonth,
              dayOfWeek,
              // fontColor: weekendFontColor && dayOfWeek > 5 ? weekendFontColor : undefined,
              timePointSec,
              nextTimePointSec,
            };
        }
      }
    },
    detailedLabelFormat: detailedDayFormat,
    minorTickLabelFormat: minorDayFormat,
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const weekStartDays: TimeRaster<TimeBin & { dayOfMonth: number }> = {
    unit: 'week',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
    binStarts: function* (domainFrom, domainTo) {
      for (const { year, month } of months.binStarts(domainFrom, domainTo)) {
        for (let dayOfMonth = 1; dayOfMonth <= 31; dayOfMonth++) {
          const temporalArgs = { timeZone, year, month, day: dayOfMonth };
          const timePoint = cachedZonedDateTimeFrom(temporalArgs);
          const dayOfWeek = timePoint[timeProp.dayOfWeek];
          if (dayOfWeek !== 1) continue;
          const timePointSec = timePoint[timeProp.epochSeconds];
          if (Number.isFinite(timePointSec)) {
            yield { dayOfMonth, timePointSec, nextTimePointSec: cachedTimeDelta(temporalArgs, 'days', 7) };
          }
        }
      }
    },
    minorTickLabelFormat: minorDayFormat,
    detailedLabelFormat: detailedDayFormat,
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const daysUnlabelled: TimeRaster<TimeBin & YearToDay> = {
    ...days,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const weeksUnlabelled: TimeRaster<TimeBin & { dayOfMonth: number }> = {
    ...weekStartDays,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const monthsUnlabelled = {
    ...months,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const hhMmDistanceMultiplier = 1.8;
  const hhMmSsDistanceMultiplier = 2.5;
  const hours: TimeRaster<TimeBin> = {
    unit: 'hour',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: hhMmDistanceMultiplier * minimumTickPixelDistance,
    binStarts: millisecondBinStarts(60 * 60 * 1000),
    detailedLabelFormat: detailedHourFormat,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, {
      ...hourFormat,
      timeZone,
    }).format,
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const hoursUnlabelled = {
    ...hours,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const sixHours: TimeRaster<TimeBin & YearToHour> = {
    unit: 'hour',
    unitMultiplier: 6,
    labeled: true,
    minimumTickPixelDistance: 2 * minimumTickPixelDistance,
    binStarts: (domainFrom, domainTo) =>
      (
        [...days.binStarts(domainFrom, domainTo)].flatMap(({ year, month, dayOfMonth, dayOfWeek }) =>
          [0, 6, 12, 18].map((hour) => {
            const temporalArgs = {
              timeZone,
              year,
              month,
              day: dayOfMonth,
              hour,
            };
            const timePoint = cachedZonedDateTimeFrom(temporalArgs);
            const timePointSec = timePoint[timeProp.epochSeconds];
            return Number.isNaN(timePointSec)
              ? []
              : {
                  dayOfMonth,
                  // fontColor: offHourFontColor && (hour < workHourMin || hour > workHourMax) ? offHourFontColor : defaultFontColor,
                  dayOfWeek,
                  hour,
                  year,
                  month,
                  timePointSec,
                  nextTimePointSec: timePointSec + 6 * 60 * 60, // fixme this is not correct in case the day is 23hrs long due to winter->summer time switch
                };
          }),
        ) as Array<TimeBin & YearToHour>
      ).map((b: TimeBin & YearToHour, i, a) =>
        Object.assign(b, { nextTimePointSec: i === a.length - 1 ? b.nextTimePointSec : a[i + 1].timePointSec }),
      ),
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, {
      ...hourFormat,
      timeZone,
    }).format,
    detailedLabelFormat: detailedHourFormat,
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const sixHoursUnlabelled = {
    ...sixHours,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const minutesFormatter = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone, hourCycle });
  const secondsFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone,
    hourCycle,
  });
  const minutes: TimeRaster<TimeBin> = {
    unit: 'minute',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: hhMmDistanceMultiplier * minimumTickPixelDistance,
    binStarts: millisecondBinStarts(60 * 1000),
    detailedLabelFormat: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...hourFormat,
      minute: 'numeric',
      timeZone,
    }).format,
    minorTickLabelFormat: (d) => `${minutesFormatter.format(d).padStart(2, '0')}`, // what DateTimeFormat doing?
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const quarterHours = {
    ...minutes,
    unitMultiplier: 15,
    labeled: true,
    binStarts: millisecondBinStarts(15 * 60 * 1000),
  };
  const quarterHoursUnlabelled = {
    ...quarterHours,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const fiveMinutes = {
    ...minutes,
    unitMultiplier: 5,
    labeled: true,
    binStarts: millisecondBinStarts(5 * 60 * 1000),
  };
  const fiveMinutesUnlabelled = {
    ...fiveMinutes,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const minutesUnlabelled = {
    ...minutes,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const seconds: TimeRaster<TimeBin> = {
    unit: 'second',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: hhMmSsDistanceMultiplier * minimumTickPixelDistance,
    binStarts: millisecondBinStarts(1000),
    detailedLabelFormat: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...hourFormat,
      minute: 'numeric',
      second: 'numeric',
      timeZone,
    }).format,
    minorTickLabelFormat: (d) => `${secondsFormatter.format(d).padStart(2, '0')}`, // what DateTimeFormat doing?
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const quarterMinutes = {
    ...seconds,
    unitMultiplier: 15,
    labeled: true,
    binStarts: millisecondBinStarts(15 * 1000),
  };
  const quarterMinutesUnlabelled = {
    ...quarterMinutes,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const fiveSeconds = {
    ...seconds,
    unitMultiplier: 5,
    labeled: true,
    binStarts: millisecondBinStarts(5 * 1000),
  };
  const fiveSecondsUnlabelled = {
    ...fiveSeconds,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const secondsUnlabelled = {
    ...seconds,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const millisecondDistanceMultiplier = 1.8;
  const milliseconds: TimeRaster<TimeBin> = {
    unit: 'millisecond',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * millisecondDistanceMultiplier,
    binStarts: millisecondBinStarts(1),
    minorTickLabelFormat: (d) => `${d % 1000}ms`,
    detailedLabelFormat: (d) => `${d % 1000}ms`,
    minimumPixelsPerSecond: NaN,
    approxWidthInMs: NaN,
  };
  const tenMilliseconds = {
    ...milliseconds,
    unitMultiplier: 10,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * millisecondDistanceMultiplier,
    binStarts: millisecondBinStarts(10),
  };
  const hundredMilliseconds = {
    ...milliseconds,
    unitMultiplier: 100,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * millisecondDistanceMultiplier,
    binStarts: millisecondBinStarts(100),
  };
  const millisecondsUnlabelled = {
    ...milliseconds,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const tenMillisecondsUnlabelled = {
    ...tenMilliseconds,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const hundredMillisecondsUnlabelled = {
    ...hundredMilliseconds,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };

  const allRasters = [
    decades,
    yearsUnlabelled,
    years,
    monthsUnlabelled,
    narrowMonths,
    shortMonths,
    months,
    weeksUnlabelled,
    weekStartDays,
    daysUnlabelled,
    days,
    sixHoursUnlabelled,
    sixHours,
    hoursUnlabelled,
    hours,
    quarterHoursUnlabelled,
    quarterHours,
    fiveMinutesUnlabelled,
    fiveMinutes,
    minutesUnlabelled,
    minutes,
    quarterMinutesUnlabelled,
    quarterMinutes,
    fiveSecondsUnlabelled,
    fiveSeconds,
    secondsUnlabelled,
    seconds,
    hundredMillisecondsUnlabelled,
    hundredMilliseconds,
    tenMillisecondsUnlabelled,
    tenMilliseconds,
    millisecondsUnlabelled,
    milliseconds,
  ]
    // enrich with derived data; Object.assign preserves object identity
    .map((r) =>
      Object.assign(r, {
        approxWidthInMs: approxWidthsInSeconds[r.unit] * r.unitMultiplier * 1000,
        minimumPixelsPerSecond: r.minimumTickPixelDistance / (approxWidthsInSeconds[r.unit] * r.unitMultiplier),
      }),
    );

  const replacements: Array<[TimeRaster<TimeBin>, Map<TimeRaster<TimeBin>, Array<TimeRaster<TimeBin>>>]> = [
    [decadesUnlabelled, new Map([])],
    [decades, new Map([[decadesUnlabelled, []]])],
    [
      years,
      new Map([
        [decades, [decadesUnlabelled]],
        [yearsUnlabelled, []],
      ]),
    ],
    [narrowMonths, new Map([[monthsUnlabelled, []]])],
    [
      shortMonths,
      new Map([
        [monthsUnlabelled, []],
        [narrowMonths, []],
      ]),
    ],
    [
      months,
      new Map([
        [monthsUnlabelled, []],
        [narrowMonths, []],
        [shortMonths, []],
      ]),
    ],
    [weekStartDays, new Map([[weeksUnlabelled, []]])],
    [
      days,
      new Map([
        [daysUnlabelled, []],
        [weekStartDays, [weeksUnlabelled]],
      ]),
    ],
    [sixHours, new Map([[sixHoursUnlabelled, []]])],
    [
      hours,
      new Map([
        [hoursUnlabelled, []],
        [sixHours, []],
      ]),
    ],
    [
      quarterHours,
      new Map([
        [quarterHoursUnlabelled, []],
        [hours, []],
        [sixHours, []],
      ]),
    ],
    [
      fiveMinutes,
      new Map([
        [fiveMinutesUnlabelled, []],
        [quarterHours, [quarterHoursUnlabelled]],
        [hours, []],
        [sixHours, []],
      ]),
    ],
    [
      minutes,
      new Map([
        [minutesUnlabelled, []],
        [quarterHours, [quarterHoursUnlabelled]],
        [fiveMinutes, [fiveMinutesUnlabelled]],
        [hours, []],
        [sixHours, []],
      ]),
    ],
    [
      quarterMinutes,
      new Map([
        [quarterMinutesUnlabelled, []],
        [minutes, []],
      ]),
    ],
    [
      fiveSeconds,
      new Map([
        [fiveSecondsUnlabelled, []],
        [quarterMinutes, [quarterMinutesUnlabelled]],
        [minutes, []],
      ]),
    ],
    [
      seconds,
      new Map([
        [secondsUnlabelled, []],
        [quarterMinutes, [quarterMinutesUnlabelled]],
        [fiveSeconds, [fiveSecondsUnlabelled]],
        [minutes, []],
      ]),
    ],
    [hundredMilliseconds, new Map([[hundredMillisecondsUnlabelled, []]])],
    [
      tenMilliseconds,
      new Map([
        [tenMillisecondsUnlabelled, []],
        [hundredMilliseconds, [hundredMillisecondsUnlabelled]],
      ]),
    ],
    [
      milliseconds,
      new Map([
        [millisecondsUnlabelled, []],
        [tenMilliseconds, [tenMillisecondsUnlabelled]],
        [hundredMilliseconds, [hundredMillisecondsUnlabelled]],
      ]),
    ],
  ];

  return (filter: (layer: TimeRaster<TimeBin>) => boolean) => {
    // keep increasingly finer granularities, but only until there's enough pixel width for them to fit
    let layers: Set<TimeRaster<TimeBin>> = new Set();
    for (const layer of allRasters) {
      if (filter(layer)) layers.add(layer);
      else break; // `rasters` is ordered, so we exit the loop here, it's already too dense, remaining ones are ignored
    }

    replacements.forEach(([key, ruleMap]) => {
      if (layers.has(key)) layers = new Set([...layers].flatMap((l) => ruleMap.get(l) ?? l));
    });

    return [...layers].reverse(); // while we iterated from coarse to dense, the result follows the axis layer order: finer toward coarser
  };
};
