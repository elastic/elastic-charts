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
exports.addTimeToObj = exports.timeObjToYear = exports.timeObjToWeekday = exports.timeObjToSeconds = exports.timeObjFromEpochSeconds = exports.timeObjFromCalendarObj = void 0;
var luxon_1 = require("luxon");
var timeObjFromCalendarObj = function (yearMonthDayHour, timeZone) {
    return luxon_1.DateTime.fromObject(__assign(__assign({}, yearMonthDayHour), { zone: timeZone }));
};
exports.timeObjFromCalendarObj = timeObjFromCalendarObj;
var timeObjFromEpochSeconds = function (timeZone, seconds) {
    return luxon_1.DateTime.fromSeconds(seconds, { zone: timeZone });
};
exports.timeObjFromEpochSeconds = timeObjFromEpochSeconds;
var timeObjToSeconds = function (t) { return t.toSeconds(); };
exports.timeObjToSeconds = timeObjToSeconds;
var timeObjToWeekday = function (t) { return t.weekday; };
exports.timeObjToWeekday = timeObjToWeekday;
var timeObjToYear = function (t) { return t.year; };
exports.timeObjToYear = timeObjToYear;
var addTimeToObj = function (obj, unit, count) {
    var _a;
    return obj.plus((_a = {}, _a[unit] = count, _a));
};
exports.addTimeToObj = addTimeToObj;
//# sourceMappingURL=chrono_luxon.js.map