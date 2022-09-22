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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKENS = exports.diffTimeObjs = exports.formatTimeObj = exports.timeObjToUTCOffset = exports.endTimeOfObj = exports.startTimeOfObj = exports.subtractTimeToObj = exports.addTimeToObj = exports.timeObjToYear = exports.timeObjToWeekday = exports.timeObjToUnixTimestamp = exports.timeObjToSeconds = exports.timeObjFromAny = exports.timeObjFromDate = exports.timeObjFromUnixTimestamp = exports.timeObjFromCalendarObj = void 0;
var moment_timezone_1 = __importDefault(require("moment-timezone"));
var timeObjFromCalendarObj = function (yearMonthDayHour, timeZone) {
    if (timeZone === void 0) { timeZone = 'browser'; }
    return timeZone
        ? moment_timezone_1.default.tz(__assign(__assign({}, yearMonthDayHour), { month: typeof yearMonthDayHour.month === 'number' ? yearMonthDayHour.month - 1 : undefined }), timeZone)
        : (0, moment_timezone_1.default)(__assign(__assign({}, yearMonthDayHour), { month: typeof yearMonthDayHour.month === 'number' ? yearMonthDayHour.month - 1 : undefined }));
};
exports.timeObjFromCalendarObj = timeObjFromCalendarObj;
var timeObjFromUnixTimestamp = function (unixTimestamp, timeZone) {
    return timeZone ? moment_timezone_1.default.tz(unixTimestamp, timeZone) : (0, moment_timezone_1.default)(unixTimestamp);
};
exports.timeObjFromUnixTimestamp = timeObjFromUnixTimestamp;
var timeObjFromDate = function (date, timeZone) {
    return timeZone ? moment_timezone_1.default.tz(date, timeZone) : (0, moment_timezone_1.default)(date);
};
exports.timeObjFromDate = timeObjFromDate;
var timeObjFromAny = function (time, timeZone) {
    return typeof time === 'number'
        ? (0, exports.timeObjFromUnixTimestamp)(time, timeZone)
        : time instanceof Date
            ? (0, exports.timeObjFromDate)(time, timeZone)
            : (0, exports.timeObjFromCalendarObj)(time, timeZone);
};
exports.timeObjFromAny = timeObjFromAny;
var timeObjToSeconds = function (t) { return t.unix(); };
exports.timeObjToSeconds = timeObjToSeconds;
var timeObjToUnixTimestamp = function (t) { return t.valueOf(); };
exports.timeObjToUnixTimestamp = timeObjToUnixTimestamp;
var timeObjToWeekday = function (t) { return t.isoWeekday(); };
exports.timeObjToWeekday = timeObjToWeekday;
var timeObjToYear = function (t) { return t.year(); };
exports.timeObjToYear = timeObjToYear;
var addTimeToObj = function (obj, unit, count) {
    return obj.add(count, unit);
};
exports.addTimeToObj = addTimeToObj;
var subtractTimeToObj = function (obj, unit, count) {
    return obj.subtract(count, unit);
};
exports.subtractTimeToObj = subtractTimeToObj;
var startTimeOfObj = function (obj, unit) {
    return obj.startOf(unit === 'week' ? 'isoWeek' : unit);
};
exports.startTimeOfObj = startTimeOfObj;
var endTimeOfObj = function (obj, unit) {
    return obj.endOf(unit === 'week' ? 'isoWeek' : unit);
};
exports.endTimeOfObj = endTimeOfObj;
var timeObjToUTCOffset = function (obj) { return obj.utcOffset(); };
exports.timeObjToUTCOffset = timeObjToUTCOffset;
var formatTimeObj = function (obj, format) { return obj.format(format); };
exports.formatTimeObj = formatTimeObj;
var diffTimeObjs = function (obj1, obj2, unit) { return obj1.diff(obj2, unit); };
exports.diffTimeObjs = diffTimeObjs;
exports.TOKENS = {
    year: 'Y',
    year2DGT: 'YY',
    year4DGT: 'YYYY',
    monthNPD: 'M',
    monthORD: 'Mo',
    monthPD: 'MM',
    monthAbr: 'MMM',
    monthFull: 'MMMM',
    dayOfMonthNP: 'D',
    dayOfMonthORD: 'Do',
    dayOfMonthPD: 'DD',
    dayOfYNP: 'DDD',
    dayOfYORD: 'DDDo',
    dayOfYPD: 'DDDD',
};
//# sourceMappingURL=moment.js.map