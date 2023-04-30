/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/unbound-method */

import { cachedTimeDelta, cachedZonedDateTimeFrom, TimeProp } from './chrono/cached_chrono';
import { epochDaysInMonth, epochInSecondsToYear } from './chrono/chrono';
import { LOCALE_TRANSLATIONS } from './locale_translations';

/** @public */
export type BinUnit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond' | 'one';

// utils
/** @public */
export const unitIntervalWidth: Record<BinUnit, number> = {
  year: 365.25 * 24 * 60 * 60,
  month: (365.25 * 24 * 60 * 60) / 12,
  week: 7 * 24 * 60 * 60,
  day: 24 * 60 * 60,
  hour: 60 * 60,
  minute: 60,
  second: 1, // for time, one second is the unit
  millisecond: 0.001,
  one: 1,
};

/**
 * Left closed, right open interval on (connected subset of) on a partially ordered set
 * Poset covers real numbers, integers, time, ordinals incl. ordered categories, trees, DAGs
 * Valid but useless for fully unordered categorical (nominal) values.
 * It's simply called Interval because we don't currently model other interval types eg. closed.
 * @public
 */
export interface Interval {
  /**
   * Lower bound of interval (included)
   */
  minimum: number;
  /**
   * Upper bound of interval (excluded)
   */
  supremum: number;
  /**
   * Upper bound of interval to stick text label
   *
   * A value of `0` defaults to the `supremum`
   */
  labelSupremum: number;
}

type IntervalIterableMaker<T extends Interval> = (domainFrom: number, domainTo: number) => Iterable<T>;

type YearsAxisLayer = AxisLayer<Interval & { year: number }>;

/** @internal */
export type NumberFormatter = (n: number) => string;

/** @internal */
export type TimeFormatter = NumberFormatter & ReturnType<typeof Intl.DateTimeFormat>['format']; // numeric input to Intl.DateTimeFormat only

/**
 * Partition of a connected subset of a totally ordered set into sub-intervals (ie. the sub-intervals are
 * gapless and overlap-free, covering a totally ordered set)
 * @internal
 */

export interface AxisLayer<T extends Interval> {
  unit: BinUnit;
  unitMultiplier: number;
  labeled: boolean;
  minimumTickPixelDistance: number;
  intervals: IntervalIterableMaker<T>;
  detailedLabelFormat: TimeFormatter;
  minorTickLabelFormat: TimeFormatter;
}

/** @internal */
export interface RasterConfig {
  minimumTickPixelDistance: number;
  locale: keyof typeof LOCALE_TRANSLATIONS;
}

const millisecondIntervals = (rasterMs: number): IntervalIterableMaker<Interval> =>
  function* (domainFrom, domainTo) {
    for (let t = Math.floor((domainFrom * 1000) / rasterMs); t < Math.ceil((domainTo * 1000) / rasterMs); t++) {
      const minimum = (t * rasterMs) / 1000;
      const supremum = minimum + rasterMs / 1000;
      yield {
        minimum,
        supremum,
        labelSupremum: supremum,
      };
    }
  };

const monthBasedIntervals = (
  years: YearsAxisLayer,
  timeZone: string,
  unitMultiplier: number,
): IntervalIterableMaker<Interval & { year: number; month: number; days: number }> =>
  function* (domainFrom, domainTo) {
    for (const { year } of years.intervals(domainFrom, domainTo)) {
      for (let month = 1; month <= 12; month += unitMultiplier) {
        const timePoint = cachedZonedDateTimeFrom({ timeZone, year, month, day: 1 });
        const binStart = timePoint[TimeProp.EpochSeconds];
        const binEnd = cachedZonedDateTimeFrom({
          timeZone,
          year: month <= 12 - unitMultiplier ? year : year + 1,
          month: ((month + unitMultiplier - 1) % 12) + 1,
          day: 1,
        })[TimeProp.EpochSeconds];
        const days = epochDaysInMonth(timeZone, binStart);
        yield {
          year,
          month,
          days,
          minimum: binStart,
          supremum: binEnd,
          labelSupremum: binEnd,
        };
      }
    }
  };

interface YearToDay {
  year: number;
  month: number;
  dayOfMonth: number;
  dayOfWeek: number;
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
export const continuousTimeRasters = ({ minimumTickPixelDistance, locale }: RasterConfig, timeZone: string) => {
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

  const years: YearsAxisLayer = {
    unit: 'year',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
    intervals: function* (domainFrom, domainTo) {
      const fromYear = epochInSecondsToYear(timeZone, domainFrom);
      const toYear = epochInSecondsToYear(timeZone, domainTo);
      for (let year = fromYear; year <= toYear; year++) {
        const timePoint = cachedZonedDateTimeFrom({ timeZone, year, month: 1, day: 1 });
        const binStart = timePoint[TimeProp.EpochSeconds];
        const binEnd = cachedZonedDateTimeFrom({
          timeZone,
          year: year + 1,
          month: 1,
          day: 1,
        })[TimeProp.EpochSeconds];
        yield {
          year,
          minimum: binStart,
          supremum: binEnd,
          labelSupremum: binEnd,
        };
      }
    },
    detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format,
  };
  const unlabeledGridMinimumPixelDistance = minimumTickPixelDistance / 1.618;
  const yearsUnlabelled: YearsAxisLayer = {
    ...years,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const decades: YearsAxisLayer = {
    unit: 'year',
    unitMultiplier: 10,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
    intervals: function* (domainFrom, domainTo) {
      const fromYear = epochInSecondsToYear(timeZone, domainFrom);
      const toYear = epochInSecondsToYear(timeZone, domainTo);
      for (let year = Math.floor(fromYear / 10) * 10; year <= Math.ceil(toYear / 10) * 10; year += 10) {
        const timePoint = cachedZonedDateTimeFrom({ timeZone, year, month: 1, day: 1 });
        const binStart = timePoint[TimeProp.EpochSeconds];
        const binEnd = cachedZonedDateTimeFrom({
          timeZone,
          year: year + 10,
          month: 1,
          day: 1,
        })[TimeProp.EpochSeconds];
        yield {
          year,
          minimum: binStart,
          supremum: binEnd,
          labelSupremum: binEnd,
        };
      }
    },
    detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone }).format,
  };
  const decadesUnlabelled: YearsAxisLayer = {
    ...decades,
    labeled: false,
    minimumTickPixelDistance: 1, // it should change if we ever add centuries and millennia
  };
  const months: AxisLayer<Interval & { year: number; month: number; days: number }> = {
    unit: 'month',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 3.6, // wow some Greek names are long
    intervals: monthBasedIntervals(years, timeZone, 1),
    detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone }).format,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'long', timeZone }).format,
  };
  const shortMonths = {
    ...months,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'short', timeZone }).format,
    minimumTickPixelDistance: minimumTickPixelDistance * 2,
  };
  const quarters: AxisLayer<Interval & { year: number; month: number }> = {
    ...shortMonths,
    unitMultiplier: 3,
    intervals: monthBasedIntervals(years, timeZone, 3),
  };
  const quartersUnlabelled = {
    ...quarters,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
    labeled: false,
  };
  const days: AxisLayer<Interval & YearToDay> = {
    unit: 'day',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
    intervals: function* (domainFrom, domainTo) {
      for (const { year, month } of months.intervals(domainFrom, domainTo)) {
        for (let dayOfMonth = 1; dayOfMonth <= 31; dayOfMonth++) {
          const temporalArgs = {
            timeZone,
            year,
            month,
            day: dayOfMonth,
          };
          const timePoint = cachedZonedDateTimeFrom(temporalArgs);
          const dayOfWeek: number = timePoint[TimeProp.DayOfWeek];
          const binStart = timePoint[TimeProp.EpochSeconds];
          const binEnd = cachedTimeDelta(temporalArgs, 'days', 1);
          if (Number.isFinite(binStart) && Number.isFinite(binEnd))
            yield {
              year,
              month,
              dayOfMonth,
              dayOfWeek,
              minimum: binStart,
              supremum: binEnd,
              labelSupremum: binEnd,
            };
        }
      }
    },
    detailedLabelFormat: detailedDayFormat,
    minorTickLabelFormat: minorDayFormat,
  };
  const weekStartDays: AxisLayer<Interval & { dayOfMonth: number }> = {
    unit: 'week',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
    intervals: function* (domainFrom, domainTo) {
      for (const { year, month, days: daysInMonth } of months.intervals(domainFrom, domainTo)) {
        for (let dayOfMonth = 1; dayOfMonth <= 31; dayOfMonth++) {
          const temporalArgs = { timeZone, year, month, day: dayOfMonth };
          const timePoint = cachedZonedDateTimeFrom(temporalArgs);
          const dayOfWeek = timePoint[TimeProp.DayOfWeek];
          if (dayOfWeek !== 1) continue;
          const binStart = timePoint[TimeProp.EpochSeconds];
          if (Number.isFinite(binStart)) {
            const daysFromEnd = daysInMonth - dayOfMonth + 1;
            const supremum = cachedTimeDelta(temporalArgs, 'days', 7);

            yield {
              dayOfMonth,
              minimum: binStart,
              supremum,
              labelSupremum: daysFromEnd < 7 ? cachedTimeDelta(temporalArgs, 'days', daysFromEnd) : supremum,
            };
          }
        }
      }
    },
    minorTickLabelFormat: minorDayFormat,
    detailedLabelFormat: detailedDayFormat,
  };
  const weeksUnlabelled: AxisLayer<Interval & { dayOfMonth: number }> = {
    ...weekStartDays,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const daysUnlabelled: AxisLayer<Interval & YearToDay> = {
    ...days,
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
  const hours: AxisLayer<Interval> = {
    unit: 'hour',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: hhMmDistanceMultiplier * minimumTickPixelDistance,
    intervals: millisecondIntervals(60 * 60 * 1000),
    detailedLabelFormat: detailedHourFormat,
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, {
      ...hourFormat,
      timeZone,
    }).format,
  };
  const hoursUnlabelled = {
    ...hours,
    labeled: false,
    minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
  };
  const sixHours: AxisLayer<Interval & YearToHour> = {
    unit: 'hour',
    unitMultiplier: 6,
    labeled: true,
    minimumTickPixelDistance: 2 * minimumTickPixelDistance,
    intervals: (domainFrom, domainTo) =>
      (
        [...days.intervals(domainFrom, domainTo)].flatMap(({ year, month, dayOfMonth, dayOfWeek }) =>
          [0, 6, 12, 18].map((hour) => {
            const temporalArgs = {
              timeZone,
              year,
              month,
              day: dayOfMonth,
              hour,
            };
            const timePoint = cachedZonedDateTimeFrom(temporalArgs);
            const binStart = timePoint[TimeProp.EpochSeconds];
            const supremum = binStart + 6 * 60 * 60; // fixme this is not correct in case the day is 23hrs long due to winter->summer time switch

            return Number.isNaN(binStart)
              ? []
              : {
                  dayOfMonth,
                  // fontColor: offHourFontColor && (hour < workHourMin || hour > workHourMax) ? offHourFontColor : defaultFontColor,
                  dayOfWeek,
                  hour,
                  year,
                  month,
                  minimum: binStart,
                  supremum,
                  labelSupremum: supremum,
                };
          }),
        ) as Array<Interval & YearToHour>
      ).map((b: Interval & YearToHour, i, a) =>
        Object.assign(b, { supremum: i === a.length - 1 ? b.supremum : a[i + 1]?.minimum }),
      ),
    minorTickLabelFormat: new Intl.DateTimeFormat(locale, {
      ...hourFormat,
      timeZone,
    }).format,
    detailedLabelFormat: detailedHourFormat,
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
  const minutes: AxisLayer<Interval> = {
    unit: 'minute',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: hhMmDistanceMultiplier * minimumTickPixelDistance,
    intervals: millisecondIntervals(60 * 1000),
    detailedLabelFormat: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...hourFormat,
      minute: 'numeric',
      timeZone,
    }).format,
    minorTickLabelFormat: (d) => `${minutesFormatter.format(d)}`,
  };
  const quarterHours = {
    ...minutes,
    unitMultiplier: 15,
    labeled: true,
    intervals: millisecondIntervals(15 * 60 * 1000),
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
    intervals: millisecondIntervals(5 * 60 * 1000),
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
  const seconds: AxisLayer<Interval> = {
    unit: 'second',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: hhMmSsDistanceMultiplier * minimumTickPixelDistance,
    intervals: millisecondIntervals(1000),
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
  };
  const quarterMinutes = {
    ...seconds,
    unitMultiplier: 15,
    labeled: true,
    intervals: millisecondIntervals(15 * 1000),
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
    intervals: millisecondIntervals(5 * 1000),
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
  const milliseconds: AxisLayer<Interval> = {
    unit: 'millisecond',
    unitMultiplier: 1,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * millisecondDistanceMultiplier,
    intervals: millisecondIntervals(1),
    minorTickLabelFormat: (d: number) => `${d % 1000}ms`,
    detailedLabelFormat: (d: number) => `${d % 1000}ms`,
  };
  const tenMilliseconds = {
    ...milliseconds,
    unitMultiplier: 10,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * millisecondDistanceMultiplier,
    intervals: millisecondIntervals(10),
  };
  const hundredMilliseconds = {
    ...milliseconds,
    unitMultiplier: 100,
    labeled: true,
    minimumTickPixelDistance: minimumTickPixelDistance * millisecondDistanceMultiplier,
    intervals: millisecondIntervals(100),
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
    quartersUnlabelled,
    quarters,
    monthsUnlabelled,
    shortMonths,
    months,
    weekStartDays,
    weeksUnlabelled,
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
  ];

  const replacements: Array<[AxisLayer<Interval>, Map<AxisLayer<Interval>, Array<AxisLayer<Interval>>>]> = [
    [decadesUnlabelled, new Map([])],
    [decades, new Map([[decadesUnlabelled, []]])],
    [
      years,
      new Map([
        [decades, [decadesUnlabelled]],
        [yearsUnlabelled, []],
      ]),
    ],
    [
      quarters,
      new Map([
        [quartersUnlabelled, []],
        [decadesUnlabelled, []],
      ]),
    ],
    [
      shortMonths,
      new Map([
        [monthsUnlabelled, []],
        [quarters, [quartersUnlabelled]],
      ]),
    ],
    [
      months,
      new Map([
        [monthsUnlabelled, []],
        [shortMonths, []],
      ]),
    ],
    [weekStartDays, new Map([[weeksUnlabelled, []]])],
    [weeksUnlabelled, new Map([[quartersUnlabelled, []]])],
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
        [sixHours, [sixHoursUnlabelled]],
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

  return (filter: (layer: AxisLayer<Interval>) => boolean) => {
    // keep increasingly finer granularities, but only until there's enough pixel width for them to fit
    let layers: Set<AxisLayer<Interval>> = new Set();
    for (const layer of allRasters) {
      if (filter(layer)) layers.add(layer);
      else break; // `rasters` is ordered, so we exit the loop here, it's already too dense, remaining ones are ignored
    }

    replacements.forEach(([key, ruleMap]) => {
      if (layers.has(key)) {
        layers = new Set([...layers].flatMap((l) => ruleMap.get(l) ?? l));
      }
    });

    return [...layers].reverse(); // while we iterated from coarse to dense, the result follows the axis layer order: finer toward coarser
  };
};
