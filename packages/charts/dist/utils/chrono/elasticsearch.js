"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIntervalToTime = exports.timeRange = exports.roundDateToESInterval = exports.ES_FIXED_INTERVAL_UNIT_TO_BASE = void 0;
const chrono_1 = require("./chrono");
exports.ES_FIXED_INTERVAL_UNIT_TO_BASE = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
};
const esCalendarIntervalToChronoInterval = {
    minute: 'minute',
    m: 'minute',
    hour: 'hour',
    h: 'hour',
    day: 'day',
    d: 'day',
    week: 'week',
    w: 'week',
    month: 'month',
    M: 'month',
    quarter: 'quarter',
    q: 'quarter',
    year: 'year',
    y: 'year',
};
function roundDateToESInterval(date, interval, snapTo, timeZone) {
    return isCalendarInterval(interval)
        ? esCalendarIntervalSnap(date, interval, snapTo, timeZone)
        : esFixedIntervalSnap(date, interval, snapTo, timeZone);
}
exports.roundDateToESInterval = roundDateToESInterval;
function isCalendarInterval(interval) {
    return interval.type === 'calendar';
}
function esCalendarIntervalSnap(date, interval, snapTo, timeZone) {
    return snapTo === 'start'
        ? (0, chrono_1.startOf)(date, timeZone, esCalendarIntervalToChronoInterval[interval.unit])
        : (0, chrono_1.endOf)(date, timeZone, esCalendarIntervalToChronoInterval[interval.unit]);
}
function esFixedIntervalSnap(date, interval, snapTo, timeZone) {
    const unitMultiplier = interval.value * exports.ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit];
    const unixTimestamp = (0, chrono_1.getUnixTimestamp)(date, timeZone);
    const utcOffsetInMs = (0, chrono_1.getUTCOffset)(date, timeZone) * 60 * 1000;
    const roundedDate = Math.floor((unixTimestamp + utcOffsetInMs) / unitMultiplier) * unitMultiplier - utcOffsetInMs;
    return snapTo === 'start' ? roundedDate : roundedDate + unitMultiplier - 1;
}
function timeRange(from, to, interval, timeZone) {
    return interval.type === 'fixed'
        ? fixedTimeRange(from, to, interval, timeZone)
        : calendarTimeRange(from, to, interval, timeZone);
}
exports.timeRange = timeRange;
function calendarTimeRange(from, to, interval, timeZone) {
    const snappedFrom = roundDateToESInterval(from, interval, 'start', timeZone);
    const snappedTo = roundDateToESInterval(to, interval, 'start', timeZone);
    const values = [snappedFrom];
    let current = snappedFrom;
    while ((0, chrono_1.addTime)(current, timeZone, esCalendarIntervalToChronoInterval[interval.unit], interval.value) < snappedTo) {
        current = (0, chrono_1.addTime)(current, timeZone, esCalendarIntervalToChronoInterval[interval.unit], interval.value);
        values.push(current);
    }
    return values;
}
function fixedTimeRange(from, to, interval, timeZone) {
    const snappedFrom = roundDateToESInterval(from, interval, 'start', timeZone);
    const snappedTo = roundDateToESInterval(to, interval, 'start', timeZone);
    const utcTo = localToUTC(snappedTo, timeZone);
    let current = localToUTC(snappedFrom, timeZone);
    const values = [current];
    while (current + interval.value * exports.ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit] < utcTo) {
        current = current + interval.value * exports.ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit];
        values.push(current);
    }
    return [...new Set(values.map((d) => utcToLocal(d, timeZone)))];
}
function addIntervalToTime(time, interval, timeZone) {
    return interval.type === 'fixed'
        ? utcToLocal(localToUTC(time, timeZone) + interval.value * exports.ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit], timeZone)
        : (0, chrono_1.addTime)(time, timeZone, esCalendarIntervalToChronoInterval[interval.unit], interval.value);
}
exports.addIntervalToTime = addIntervalToTime;
function utcToLocal(time, timeZone) {
    return time - (0, chrono_1.getUTCOffset)(time, timeZone) * 60 * 1000;
}
function localToUTC(time, timeZone) {
    return time + (0, chrono_1.getUTCOffset)(time, timeZone) * 60 * 1000;
}
//# sourceMappingURL=elasticsearch.js.map