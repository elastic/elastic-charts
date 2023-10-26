"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTimeToObj = exports.timeObjToYear = exports.timeObjToWeekday = exports.timeObjToSeconds = exports.timeObjFromEpochSeconds = exports.timeObjFromCalendarObj = void 0;
const luxon_1 = require("luxon");
const timeObjFromCalendarObj = (yearMonthDayHour, timeZone) => luxon_1.DateTime.fromObject({ ...yearMonthDayHour, zone: timeZone });
exports.timeObjFromCalendarObj = timeObjFromCalendarObj;
const timeObjFromEpochSeconds = (timeZone, seconds) => luxon_1.DateTime.fromSeconds(seconds, { zone: timeZone });
exports.timeObjFromEpochSeconds = timeObjFromEpochSeconds;
const timeObjToSeconds = (t) => t.toSeconds();
exports.timeObjToSeconds = timeObjToSeconds;
const timeObjToWeekday = (t) => t.weekday;
exports.timeObjToWeekday = timeObjToWeekday;
const timeObjToYear = (t) => t.year;
exports.timeObjToYear = timeObjToYear;
const addTimeToObj = (obj, unit, count) => obj.plus({ [unit]: count });
exports.addTimeToObj = addTimeToObj;
//# sourceMappingURL=chrono_luxon.js.map