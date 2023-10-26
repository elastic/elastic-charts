"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.continuousTimeRasters = exports.unitIntervalWidth = void 0;
const cached_chrono_1 = require("./chrono/cached_chrono");
const chrono_1 = require("./chrono/chrono");
exports.unitIntervalWidth = {
    year: 365.25 * 24 * 60 * 60,
    month: (365.25 * 24 * 60 * 60) / 12,
    week: 7 * 24 * 60 * 60,
    day: 24 * 60 * 60,
    hour: 60 * 60,
    minute: 60,
    second: 1,
    millisecond: 0.001,
    one: 1,
};
const millisecondIntervals = (rasterMs) => function* (domainFrom, domainTo) {
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
const monthBasedIntervals = (years, timeZone, unitMultiplier) => function* (domainFrom, domainTo) {
    for (const { year } of years.intervals(domainFrom, domainTo)) {
        for (let month = 1; month <= 12; month += unitMultiplier) {
            const timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone, year, month, day: 1 });
            const binStart = timePoint[cached_chrono_1.TimeProp.EpochSeconds];
            const binEnd = (0, cached_chrono_1.cachedZonedDateTimeFrom)({
                timeZone,
                year: month <= 12 - unitMultiplier ? year : year + 1,
                month: ((month + unitMultiplier - 1) % 12) + 1,
                day: 1,
            })[cached_chrono_1.TimeProp.EpochSeconds];
            const days = (0, chrono_1.epochDaysInMonth)(timeZone, binStart);
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
const hourCycle = 'h23';
const hourFormat = {
    hour: '2-digit',
    minute: '2-digit',
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
const englishOrdinalEnding = (signedNumber) => englishOrdinalEndings[englishPluralRules.select(signedNumber)];
const continuousTimeRasters = ({ minimumTickPixelDistance, locale }, timeZone) => {
    const minorDayBaseFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone }).format;
    const minorDayFormat = (d) => {
        const numberString = minorDayBaseFormat(d);
        const number = Number.parseInt(numberString, 10);
        return locale.substring(0, 2) === 'en' ? `${numberString}${englishOrdinalEnding(number)}` : numberString;
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
    const detailedHourFormat = (d) => `${detailedHourFormatBase(d)}h`;
    const years = {
        unit: 'year',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
        intervals: function* (domainFrom, domainTo) {
            const fromYear = (0, chrono_1.epochInSecondsToYear)(timeZone, domainFrom);
            const toYear = (0, chrono_1.epochInSecondsToYear)(timeZone, domainTo);
            for (let year = fromYear; year <= toYear; year++) {
                const timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone, year, month: 1, day: 1 });
                const binStart = timePoint[cached_chrono_1.TimeProp.EpochSeconds];
                const binEnd = (0, cached_chrono_1.cachedZonedDateTimeFrom)({
                    timeZone,
                    year: year + 1,
                    month: 1,
                    day: 1,
                })[cached_chrono_1.TimeProp.EpochSeconds];
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
    const yearsUnlabelled = {
        ...years,
        labeled: false,
        minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
    };
    const decades = {
        unit: 'year',
        unitMultiplier: 10,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
        intervals: function* (domainFrom, domainTo) {
            const fromYear = (0, chrono_1.epochInSecondsToYear)(timeZone, domainFrom);
            const toYear = (0, chrono_1.epochInSecondsToYear)(timeZone, domainTo);
            for (let year = Math.floor(fromYear / 10) * 10; year <= Math.ceil(toYear / 10) * 10; year += 10) {
                const timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone, year, month: 1, day: 1 });
                const binStart = timePoint[cached_chrono_1.TimeProp.EpochSeconds];
                const binEnd = (0, cached_chrono_1.cachedZonedDateTimeFrom)({
                    timeZone,
                    year: year + 10,
                    month: 1,
                    day: 1,
                })[cached_chrono_1.TimeProp.EpochSeconds];
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
    const decadesUnlabelled = {
        ...decades,
        labeled: false,
        minimumTickPixelDistance: 1,
    };
    const months = {
        unit: 'month',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 3.6,
        intervals: monthBasedIntervals(years, timeZone, 1),
        detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone }).format,
        minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'long', timeZone }).format,
    };
    const shortMonths = {
        ...months,
        minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'short', timeZone }).format,
        minimumTickPixelDistance: minimumTickPixelDistance * 2,
    };
    const quarters = {
        ...shortMonths,
        unitMultiplier: 3,
        intervals: monthBasedIntervals(years, timeZone, 3),
    };
    const quartersUnlabelled = {
        ...quarters,
        minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
        labeled: false,
    };
    const days = {
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
                    const timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)(temporalArgs);
                    const dayOfWeek = timePoint[cached_chrono_1.TimeProp.DayOfWeek];
                    const binStart = timePoint[cached_chrono_1.TimeProp.EpochSeconds];
                    const binEnd = (0, cached_chrono_1.cachedTimeDelta)(temporalArgs, 'days', 1);
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
    const weekStartDays = {
        unit: 'week',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
        intervals: function* (domainFrom, domainTo) {
            for (const { year, month, days: daysInMonth } of months.intervals(domainFrom, domainTo)) {
                for (let dayOfMonth = 1; dayOfMonth <= 31; dayOfMonth++) {
                    const temporalArgs = { timeZone, year, month, day: dayOfMonth };
                    const timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)(temporalArgs);
                    const dayOfWeek = timePoint[cached_chrono_1.TimeProp.DayOfWeek];
                    if (dayOfWeek !== 1)
                        continue;
                    const binStart = timePoint[cached_chrono_1.TimeProp.EpochSeconds];
                    if (Number.isFinite(binStart)) {
                        const daysFromEnd = daysInMonth - dayOfMonth + 1;
                        const supremum = (0, cached_chrono_1.cachedTimeDelta)(temporalArgs, 'days', 7);
                        yield {
                            dayOfMonth,
                            minimum: binStart,
                            supremum,
                            labelSupremum: daysFromEnd < 7 ? (0, cached_chrono_1.cachedTimeDelta)(temporalArgs, 'days', daysFromEnd) : supremum,
                        };
                    }
                }
            }
        },
        minorTickLabelFormat: minorDayFormat,
        detailedLabelFormat: detailedDayFormat,
    };
    const daysUnlabelled = {
        ...days,
        labeled: false,
        minimumTickPixelDistance: unlabeledGridMinimumPixelDistance,
    };
    const weeksUnlabelled = {
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
    const hours = {
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
    const sixHours = {
        unit: 'hour',
        unitMultiplier: 6,
        labeled: true,
        minimumTickPixelDistance: 2 * minimumTickPixelDistance,
        intervals: (domainFrom, domainTo) => [...days.intervals(domainFrom, domainTo)].flatMap(({ year, month, dayOfMonth, dayOfWeek }) => [0, 6, 12, 18].map((hour) => {
            const temporalArgs = {
                timeZone,
                year,
                month,
                day: dayOfMonth,
                hour,
            };
            const timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)(temporalArgs);
            const binStart = timePoint[cached_chrono_1.TimeProp.EpochSeconds];
            const supremum = binStart + 6 * 60 * 60;
            return Number.isNaN(binStart)
                ? []
                : {
                    dayOfMonth,
                    dayOfWeek,
                    hour,
                    year,
                    month,
                    minimum: binStart,
                    supremum,
                    labelSupremum: supremum,
                };
        })).map((b, i, a) => { var _a; return Object.assign(b, { supremum: i === a.length - 1 ? b.supremum : (_a = a[i + 1]) === null || _a === void 0 ? void 0 : _a.minimum }); }),
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
    const minutes = {
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
    const seconds = {
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
        minorTickLabelFormat: (d) => `${secondsFormatter.format(d).padStart(2, '0')}`,
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
    const milliseconds = {
        unit: 'millisecond',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * millisecondDistanceMultiplier,
        intervals: millisecondIntervals(1),
        minorTickLabelFormat: (d) => `${d % 1000}ms`,
        detailedLabelFormat: (d) => `${d % 1000}ms`,
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
    ];
    const replacements = [
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
    return (filter) => {
        let layers = new Set();
        for (const layer of allRasters) {
            if (filter(layer))
                layers.add(layer);
            else
                break;
        }
        replacements.forEach(([key, ruleMap]) => {
            if (layers.has(key)) {
                layers = new Set([...layers].flatMap((l) => { var _a; return (_a = ruleMap.get(l)) !== null && _a !== void 0 ? _a : l; }));
            }
        });
        return [...layers].reverse();
    };
};
exports.continuousTimeRasters = continuousTimeRasters;
//# sourceMappingURL=continuous_time_rasters.js.map