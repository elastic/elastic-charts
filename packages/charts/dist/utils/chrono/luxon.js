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
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffTimeObjs = exports.formatTimeObj = exports.timeObjToUTCOffset = exports.endTimeOfObj = exports.startTimeOfObj = exports.subtractTimeToObj = exports.addTimeToObj = exports.timeObjToYear = exports.timeObjToWeekday = exports.timeObjToUnixTimestamp = exports.timeObjToSeconds = exports.timeObjFromAny = exports.timeObjFromDate = exports.timeObjFromUnixTimestamp = exports.timeObjFromCalendarObj = void 0;
var luxon_1 = require("luxon");
var timeObjFromCalendarObj = function (yearMonthDayHour, timeZone) {
    if (timeZone === void 0) { timeZone = 'local'; }
    return luxon_1.DateTime.fromObject(__assign(__assign({}, yearMonthDayHour), { zone: timeZone }));
};
exports.timeObjFromCalendarObj = timeObjFromCalendarObj;
var timeObjFromUnixTimestamp = function (unixTimestamp, timeZone) {
    if (timeZone === void 0) { timeZone = 'local'; }
    return luxon_1.DateTime.fromMillis(unixTimestamp, { zone: timeZone });
};
exports.timeObjFromUnixTimestamp = timeObjFromUnixTimestamp;
var timeObjFromDate = function (date, timeZone) {
    if (timeZone === void 0) { timeZone = 'local'; }
    return luxon_1.DateTime.fromJSDate(date, { zone: timeZone });
};
exports.timeObjFromDate = timeObjFromDate;
var timeObjFromAny = function (time, timeZone) {
    if (timeZone === void 0) { timeZone = 'local'; }
    return typeof time === 'number'
        ? (0, exports.timeObjFromUnixTimestamp)(time, timeZone)
        : time instanceof Date
            ? (0, exports.timeObjFromDate)(time, timeZone)
            : (0, exports.timeObjFromCalendarObj)(time, timeZone);
};
exports.timeObjFromAny = timeObjFromAny;
var timeObjToSeconds = function (t) { return t.toSeconds(); };
exports.timeObjToSeconds = timeObjToSeconds;
var timeObjToUnixTimestamp = function (t) { return t.toMillis(); };
exports.timeObjToUnixTimestamp = timeObjToUnixTimestamp;
var timeObjToWeekday = function (t) { return t.weekday; };
exports.timeObjToWeekday = timeObjToWeekday;
var timeObjToYear = function (t) { return t.year; };
exports.timeObjToYear = timeObjToYear;
var addTimeToObj = function (obj, unit, count) {
    var _a;
    return obj.plus((_a = {}, _a[unit] = count, _a));
};
exports.addTimeToObj = addTimeToObj;
var subtractTimeToObj = function (obj, unit, count) {
    var _a;
    return obj.minus((_a = {}, _a[unit] = count, _a));
};
exports.subtractTimeToObj = subtractTimeToObj;
var startTimeOfObj = function (obj, unit) { return obj.startOf(unit); };
exports.startTimeOfObj = startTimeOfObj;
var endTimeOfObj = function (obj, unit) { return obj.endOf(unit); };
exports.endTimeOfObj = endTimeOfObj;
var timeObjToUTCOffset = function (obj) { return obj.offset; };
exports.timeObjToUTCOffset = timeObjToUTCOffset;
var formatTimeObj = function (obj, format) { return obj.toFormat(format); };
exports.formatTimeObj = formatTimeObj;
var diffTimeObjs = function (obj1, obj2, unit) { return obj1.diff(obj2, unit).as(unit); };
exports.diffTimeObjs = diffTimeObjs;
//# sourceMappingURL=luxon.js.map