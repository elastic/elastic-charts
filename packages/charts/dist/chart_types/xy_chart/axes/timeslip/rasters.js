"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
exports.rasters = void 0;
var cached_chrono_1 = require("./chrono/cached_chrono");
var chrono_1 = require("./chrono/chrono");
var approxWidthsInSeconds = {
    year: 365.25 * 24 * 60 * 60,
    month: (365.25 * 24 * 60 * 60) / 12,
    week: 7 * 24 * 60 * 60,
    day: 24 * 60 * 60,
    hour: 60 * 60,
    minute: 60,
    second: 1,
    millisecond: 0.001,
};
var millisecondBinStarts = function (rasterMs) {
    return function (domainFrom, domainTo) {
        var t, timePointSec;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    t = Math.floor((domainFrom * 1000) / rasterMs);
                    _a.label = 1;
                case 1:
                    if (!(t < Math.ceil((domainTo * 1000) / rasterMs))) return [3, 4];
                    timePointSec = (t * rasterMs) / 1000;
                    return [4, {
                            timePointSec: timePointSec,
                            nextTimePointSec: timePointSec + rasterMs / 1000,
                        }];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    t++;
                    return [3, 1];
                case 4: return [2];
            }
        });
    };
};
var hourFormat = {
    hour: '2-digit',
    hourCycle: 'h23',
};
var englishOrdinalEndings = {
    zero: 'th',
    one: 'st',
    two: 'nd',
    few: 'rd',
    many: 'th',
    other: 'th',
};
var englishPluralRules = new Intl.PluralRules('en-US', { type: 'ordinal' });
var englishOrdinalEnding = function (signedNumber) { return englishOrdinalEndings[englishPluralRules.select(signedNumber)]; };
var rasters = function (_a, timeZone) {
    var minimumTickPixelDistance = _a.minimumTickPixelDistance, locale = _a.locale;
    var minorDayBaseFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: timeZone }).format;
    var minorDayFormat = function (d) {
        var numberString = minorDayBaseFormat(d);
        var number = Number.parseInt(numberString, 10);
        return locale.substr(0, 2) === 'en' ? "".concat(numberString).concat(englishOrdinalEnding(number)) : numberString;
    };
    var detailedDayFormat = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: timeZone,
    }).format;
    var detailedHourFormatBase = new Intl.DateTimeFormat(locale, __assign(__assign({ year: 'numeric', month: 'short', day: 'numeric' }, hourFormat), { timeZone: timeZone })).format;
    var detailedHourFormat = function (d) { return "".concat(detailedHourFormatBase(d), "h"); };
    var years = {
        unit: 'year',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
        binStarts: function (domainFrom, domainTo) {
            var fromYear, toYear, year, timePoint, timePointSec, nextTimePointSec;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fromYear = (0, chrono_1.epochInSecondsToYear)(timeZone, domainFrom);
                        toYear = (0, chrono_1.epochInSecondsToYear)(timeZone, domainTo);
                        year = fromYear;
                        _a.label = 1;
                    case 1:
                        if (!(year <= toYear)) return [3, 4];
                        timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone: timeZone, year: year, month: 1, day: 1 });
                        timePointSec = timePoint[cached_chrono_1.timeProp.epochSeconds];
                        nextTimePointSec = (0, cached_chrono_1.cachedZonedDateTimeFrom)({
                            timeZone: timeZone,
                            year: year + 1,
                            month: 1,
                            day: 1,
                        })[cached_chrono_1.timeProp.epochSeconds];
                        return [4, { year: year, timePointSec: timePointSec, nextTimePointSec: nextTimePointSec }];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        year++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        },
        detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone: timeZone }).format,
        minorTickLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone: timeZone }).format,
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var yearsUnlabelled = __assign(__assign({}, years), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var decades = {
        unit: 'year',
        unitMultiplier: 10,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
        binStarts: function (domainFrom, domainTo) {
            var fromYear, toYear, year, timePoint, timePointSec, nextTimePointSec;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fromYear = (0, chrono_1.epochInSecondsToYear)(timeZone, domainFrom);
                        toYear = (0, chrono_1.epochInSecondsToYear)(timeZone, domainTo);
                        year = Math.floor(fromYear / 10) * 10;
                        _a.label = 1;
                    case 1:
                        if (!(year <= Math.ceil(toYear / 10) * 10)) return [3, 4];
                        timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone: timeZone, year: year, month: 1, day: 1 });
                        timePointSec = timePoint[cached_chrono_1.timeProp.epochSeconds];
                        nextTimePointSec = (0, cached_chrono_1.cachedZonedDateTimeFrom)({
                            timeZone: timeZone,
                            year: year + 10,
                            month: 1,
                            day: 1,
                        })[cached_chrono_1.timeProp.epochSeconds];
                        return [4, { year: year, timePointSec: timePointSec, nextTimePointSec: nextTimePointSec }];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        year += 10;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        },
        detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone: timeZone }).format,
        minorTickLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', timeZone: timeZone }).format,
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var decadesUnlabelled = __assign(__assign({}, decades), { labeled: false, minimumTickPixelDistance: 1 });
    var months = {
        unit: 'month',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 3.6,
        binStarts: function (domainFrom, domainTo) {
            var _a, _b, year, month, timePoint, timePointSec, nextTimePointSec, e_1_1;
            var e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, 8, 9]);
                        _a = __values(years.binStarts(domainFrom, domainTo)), _b = _a.next();
                        _d.label = 1;
                    case 1:
                        if (!!_b.done) return [3, 6];
                        year = _b.value.year;
                        month = 1;
                        _d.label = 2;
                    case 2:
                        if (!(month <= 12)) return [3, 5];
                        timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)({ timeZone: timeZone, year: year, month: month, day: 1 });
                        timePointSec = timePoint[cached_chrono_1.timeProp.epochSeconds];
                        nextTimePointSec = (0, cached_chrono_1.cachedZonedDateTimeFrom)({
                            timeZone: timeZone,
                            year: month < 12 ? year : year + 1,
                            month: (month % 12) + 1,
                            day: 1,
                        })[cached_chrono_1.timeProp.epochSeconds];
                        return [4, { year: year, month: month, timePointSec: timePointSec, nextTimePointSec: nextTimePointSec }];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4:
                        month++;
                        return [3, 2];
                    case 5:
                        _b = _a.next();
                        return [3, 1];
                    case 6: return [3, 9];
                    case 7:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3, 9];
                    case 8:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7];
                    case 9: return [2];
                }
            });
        },
        detailedLabelFormat: new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: timeZone }).format,
        minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'long', timeZone: timeZone }).format,
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var shortMonths = __assign(__assign({}, months), { minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'short', timeZone: timeZone }).format, minimumTickPixelDistance: minimumTickPixelDistance * 2 });
    var narrowMonths = __assign(__assign({}, months), { minorTickLabelFormat: new Intl.DateTimeFormat(locale, { month: 'narrow', timeZone: timeZone }).format, minimumTickPixelDistance: minimumTickPixelDistance });
    var days = {
        unit: 'day',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 1.5,
        binStarts: function (domainFrom, domainTo) {
            var _a, _b, _c, year, month, dayOfMonth, temporalArgs, timePoint, dayOfWeek, timePointSec, nextTimePointSec, e_2_1;
            var e_2, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, 8, 9]);
                        _a = __values(months.binStarts(domainFrom, domainTo)), _b = _a.next();
                        _e.label = 1;
                    case 1:
                        if (!!_b.done) return [3, 6];
                        _c = _b.value, year = _c.year, month = _c.month;
                        dayOfMonth = 1;
                        _e.label = 2;
                    case 2:
                        if (!(dayOfMonth <= 31)) return [3, 5];
                        temporalArgs = {
                            timeZone: timeZone,
                            year: year,
                            month: month,
                            day: dayOfMonth,
                        };
                        timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)(temporalArgs);
                        dayOfWeek = timePoint[cached_chrono_1.timeProp.dayOfWeek];
                        timePointSec = timePoint[cached_chrono_1.timeProp.epochSeconds];
                        nextTimePointSec = (0, cached_chrono_1.cachedTimeDelta)(temporalArgs, 'days', 1);
                        if (!(Number.isFinite(timePointSec) && Number.isFinite(nextTimePointSec))) return [3, 4];
                        return [4, {
                                year: year,
                                month: month,
                                dayOfMonth: dayOfMonth,
                                dayOfWeek: dayOfWeek,
                                timePointSec: timePointSec,
                                nextTimePointSec: nextTimePointSec,
                            }];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        dayOfMonth++;
                        return [3, 2];
                    case 5:
                        _b = _a.next();
                        return [3, 1];
                    case 6: return [3, 9];
                    case 7:
                        e_2_1 = _e.sent();
                        e_2 = { error: e_2_1 };
                        return [3, 9];
                    case 8:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7];
                    case 9: return [2];
                }
            });
        },
        detailedLabelFormat: detailedDayFormat,
        minorTickLabelFormat: minorDayFormat,
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var weekStartDays = {
        unit: 'week',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance,
        binStarts: function (domainFrom, domainTo) {
            var _a, _b, _c, year, month, dayOfMonth, temporalArgs, timePoint, dayOfWeek, timePointSec, e_3_1;
            var e_3, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, 8, 9]);
                        _a = __values(months.binStarts(domainFrom, domainTo)), _b = _a.next();
                        _e.label = 1;
                    case 1:
                        if (!!_b.done) return [3, 6];
                        _c = _b.value, year = _c.year, month = _c.month;
                        dayOfMonth = 1;
                        _e.label = 2;
                    case 2:
                        if (!(dayOfMonth <= 31)) return [3, 5];
                        temporalArgs = { timeZone: timeZone, year: year, month: month, day: dayOfMonth };
                        timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)(temporalArgs);
                        dayOfWeek = timePoint[cached_chrono_1.timeProp.dayOfWeek];
                        if (dayOfWeek !== 1)
                            return [3, 4];
                        timePointSec = timePoint[cached_chrono_1.timeProp.epochSeconds];
                        if (!Number.isFinite(timePointSec)) return [3, 4];
                        return [4, { dayOfMonth: dayOfMonth, timePointSec: timePointSec, nextTimePointSec: (0, cached_chrono_1.cachedTimeDelta)(temporalArgs, 'days', 7) }];
                    case 3:
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        dayOfMonth++;
                        return [3, 2];
                    case 5:
                        _b = _a.next();
                        return [3, 1];
                    case 6: return [3, 9];
                    case 7:
                        e_3_1 = _e.sent();
                        e_3 = { error: e_3_1 };
                        return [3, 9];
                    case 8:
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7];
                    case 9: return [2];
                }
            });
        },
        minorTickLabelFormat: minorDayFormat,
        detailedLabelFormat: detailedDayFormat,
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var daysUnlabelled = __assign(__assign({}, days), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var weeksUnlabelled = __assign(__assign({}, weekStartDays), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var monthsUnlabelled = __assign(__assign({}, months), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var hours = {
        unit: 'hour',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: 2 * minimumTickPixelDistance,
        binStarts: millisecondBinStarts(60 * 60 * 1000),
        detailedLabelFormat: detailedHourFormat,
        minorTickLabelFormat: new Intl.DateTimeFormat(locale, __assign(__assign({}, hourFormat), { timeZone: timeZone })).format,
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var hoursUnlabelled = __assign(__assign({}, hours), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var sixHours = {
        unit: 'hour',
        unitMultiplier: 6,
        labeled: true,
        minimumTickPixelDistance: 2 * minimumTickPixelDistance,
        binStarts: function (domainFrom, domainTo) {
            return __spreadArray([], __read(days.binStarts(domainFrom, domainTo)), false).flatMap(function (_a) {
                var year = _a.year, month = _a.month, dayOfMonth = _a.dayOfMonth, dayOfWeek = _a.dayOfWeek;
                return [0, 6, 12, 18].map(function (hour) {
                    var temporalArgs = {
                        timeZone: timeZone,
                        year: year,
                        month: month,
                        day: dayOfMonth,
                        hour: hour,
                    };
                    var timePoint = (0, cached_chrono_1.cachedZonedDateTimeFrom)(temporalArgs);
                    var timePointSec = timePoint[cached_chrono_1.timeProp.epochSeconds];
                    return Number.isNaN(timePointSec)
                        ? []
                        : {
                            dayOfMonth: dayOfMonth,
                            dayOfWeek: dayOfWeek,
                            hour: hour,
                            year: year,
                            month: month,
                            timePointSec: timePointSec,
                            nextTimePointSec: timePointSec + 6 * 60 * 60,
                        };
                });
            }).map(function (b, i, a) {
                return Object.assign(b, { nextTimePointSec: i === a.length - 1 ? b.nextTimePointSec : a[i + 1].timePointSec });
            });
        },
        minorTickLabelFormat: new Intl.DateTimeFormat(locale, __assign(__assign({}, hourFormat), { timeZone: timeZone })).format,
        detailedLabelFormat: detailedHourFormat,
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var sixHoursUnlabelled = __assign(__assign({}, sixHours), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var minutes = {
        unit: 'minute',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance,
        binStarts: millisecondBinStarts(60 * 1000),
        detailedLabelFormat: new Intl.DateTimeFormat(locale, __assign(__assign({ year: 'numeric', month: 'short', day: 'numeric' }, hourFormat), { minute: 'numeric', timeZone: timeZone })).format,
        minorTickLabelFormat: function (d) {
            return "".concat(new Intl.DateTimeFormat(locale, {
                minute: 'numeric',
                timeZone: timeZone,
            }).format(d), "'");
        },
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var quarterHours = __assign(__assign({}, minutes), { unitMultiplier: 15, labeled: true, minimumTickPixelDistance: minimumTickPixelDistance, binStarts: millisecondBinStarts(15 * 60 * 1000) });
    var quarterHoursUnlabelled = __assign(__assign({}, quarterHours), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var fiveMinutes = __assign(__assign({}, minutes), { unitMultiplier: 5, labeled: true, minimumTickPixelDistance: minimumTickPixelDistance, binStarts: millisecondBinStarts(5 * 60 * 1000) });
    var fiveMinutesUnlabelled = __assign(__assign({}, fiveMinutes), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var minutesUnlabelled = __assign(__assign({}, minutes), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var seconds = {
        unit: 'second',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance,
        binStarts: millisecondBinStarts(1000),
        detailedLabelFormat: new Intl.DateTimeFormat(locale, __assign(__assign({ year: 'numeric', month: 'short', day: 'numeric' }, hourFormat), { minute: 'numeric', second: 'numeric', timeZone: timeZone })).format,
        minorTickLabelFormat: function (d) {
            return "".concat(new Intl.DateTimeFormat(locale, {
                second: 'numeric',
                timeZone: timeZone,
            }).format(d), "\"");
        },
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var quarterMinutes = __assign(__assign({}, seconds), { unitMultiplier: 15, labeled: true, minimumTickPixelDistance: minimumTickPixelDistance, binStarts: millisecondBinStarts(15 * 1000) });
    var quarterMinutesUnlabelled = __assign(__assign({}, quarterMinutes), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var fiveSeconds = __assign(__assign({}, seconds), { unitMultiplier: 5, labeled: true, minimumTickPixelDistance: minimumTickPixelDistance, binStarts: millisecondBinStarts(5 * 1000) });
    var fiveSecondsUnlabelled = __assign(__assign({}, fiveSeconds), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var secondsUnlabelled = __assign(__assign({}, seconds), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var milliseconds = {
        unit: 'millisecond',
        unitMultiplier: 1,
        labeled: true,
        minimumTickPixelDistance: minimumTickPixelDistance * 1.8,
        binStarts: millisecondBinStarts(1),
        minorTickLabelFormat: function (d) { return "".concat(d % 1000, "ms"); },
        detailedLabelFormat: function (d) { return "".concat(d % 1000, "ms"); },
        minimumPixelsPerSecond: NaN,
        approxWidthInMs: NaN,
    };
    var tenMilliseconds = __assign(__assign({}, milliseconds), { unitMultiplier: 10, labeled: true, minimumTickPixelDistance: minimumTickPixelDistance * 1.8, binStarts: millisecondBinStarts(10) });
    var hundredMilliseconds = __assign(__assign({}, milliseconds), { unitMultiplier: 100, labeled: true, minimumTickPixelDistance: minimumTickPixelDistance * 1.8, binStarts: millisecondBinStarts(100) });
    var millisecondsUnlabelled = __assign(__assign({}, milliseconds), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var tenMillisecondsUnlabelled = __assign(__assign({}, tenMilliseconds), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var hundredMillisecondsUnlabelled = __assign(__assign({}, hundredMilliseconds), { labeled: false, minimumTickPixelDistance: minimumTickPixelDistance / 2 });
    var allRasters = [
        decades,
        yearsUnlabelled,
        years,
        monthsUnlabelled,
        narrowMonths,
        shortMonths,
        months,
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
        .map(function (r) {
        return Object.assign(r, {
            approxWidthInMs: approxWidthsInSeconds[r.unit] * r.unitMultiplier * 1000,
            minimumPixelsPerSecond: r.minimumTickPixelDistance / (approxWidthsInSeconds[r.unit] * r.unitMultiplier),
        });
    });
    var replacements = [
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
        [quarterHours, new Map([[quarterHoursUnlabelled, []]])],
        [
            fiveMinutes,
            new Map([
                [fiveMinutesUnlabelled, []],
                [quarterHours, [quarterHoursUnlabelled]],
            ]),
        ],
        [
            minutes,
            new Map([
                [minutesUnlabelled, []],
                [quarterHours, [quarterHoursUnlabelled]],
                [fiveMinutes, [fiveMinutesUnlabelled]],
            ]),
        ],
        [quarterMinutes, new Map([[quarterMinutesUnlabelled, []]])],
        [
            fiveSeconds,
            new Map([
                [fiveSecondsUnlabelled, []],
                [quarterMinutes, [quarterMinutesUnlabelled]],
            ]),
        ],
        [
            seconds,
            new Map([
                [secondsUnlabelled, []],
                [quarterMinutes, [quarterMinutesUnlabelled]],
                [fiveSeconds, [fiveSecondsUnlabelled]],
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
    return function (filter) {
        var e_4, _a;
        var layers = new Set();
        try {
            for (var allRasters_1 = __values(allRasters), allRasters_1_1 = allRasters_1.next(); !allRasters_1_1.done; allRasters_1_1 = allRasters_1.next()) {
                var layer = allRasters_1_1.value;
                if (filter(layer))
                    layers.add(layer);
                else
                    break;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (allRasters_1_1 && !allRasters_1_1.done && (_a = allRasters_1.return)) _a.call(allRasters_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
        replacements.forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], ruleMap = _b[1];
            if (layers.has(key))
                layers = new Set(__spreadArray([], __read(layers), false).flatMap(function (l) { var _a; return (_a = ruleMap.get(l)) !== null && _a !== void 0 ? _a : l; }));
        });
        return __spreadArray([], __read(layers), false).reverse();
    };
};
exports.rasters = rasters;
//# sourceMappingURL=rasters.js.map