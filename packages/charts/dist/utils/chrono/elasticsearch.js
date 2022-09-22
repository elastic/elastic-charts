"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIntervalToTime = exports.timeRange = exports.roundDateToESInterval = exports.ES_FIXED_INTERVAL_UNIT_TO_BASE = void 0;
var chrono_1 = require("./chrono");
exports.ES_FIXED_INTERVAL_UNIT_TO_BASE = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
};
var esCalendarIntervalToChronoInterval = {
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
    var unitMultiplier = interval.value * exports.ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit];
    var unixTimestamp = (0, chrono_1.getUnixTimestamp)(date, timeZone);
    var utcOffsetInMs = (0, chrono_1.getUTCOffset)(date, timeZone) * 60 * 1000;
    var roundedDate = Math.floor((unixTimestamp + utcOffsetInMs) / unitMultiplier) * unitMultiplier - utcOffsetInMs;
    return snapTo === 'start' ? roundedDate : roundedDate + unitMultiplier - 1;
}
function timeRange(from, to, interval, timeZone) {
    return interval.type === 'fixed'
        ? fixedTimeRange(from, to, interval, timeZone)
        : calendarTimeRange(from, to, interval, timeZone);
}
exports.timeRange = timeRange;
function calendarTimeRange(from, to, interval, timeZone) {
    var snappedFrom = roundDateToESInterval(from, interval, 'start', timeZone);
    var snappedTo = roundDateToESInterval(to, interval, 'start', timeZone);
    var values = [snappedFrom];
    var current = snappedFrom;
    while ((0, chrono_1.addTime)(current, timeZone, esCalendarIntervalToChronoInterval[interval.unit], interval.value) < snappedTo) {
        current = (0, chrono_1.addTime)(current, timeZone, esCalendarIntervalToChronoInterval[interval.unit], interval.value);
        values.push(current);
    }
    return values;
}
function fixedTimeRange(from, to, interval, timeZone) {
    var snappedFrom = roundDateToESInterval(from, interval, 'start', timeZone);
    var snappedTo = roundDateToESInterval(to, interval, 'start', timeZone);
    var utcTo = localToUTC(snappedTo, timeZone);
    var current = localToUTC(snappedFrom, timeZone);
    var values = [current];
    while (current + interval.value * exports.ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit] < utcTo) {
        current = current + interval.value * exports.ES_FIXED_INTERVAL_UNIT_TO_BASE[interval.unit];
        values.push(current);
    }
    return __spreadArray([], __read(new Set(values.map(function (d) { return utcToLocal(d, timeZone); }))), false);
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