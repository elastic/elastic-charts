"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffTimeObjs = exports.formatTimeObj = exports.timeObjToUTCOffset = exports.endTimeOfObj = exports.startTimeOfObj = exports.subtractTimeToObj = exports.addTimeToObj = exports.timeObjToYear = exports.timeObjToWeekday = exports.timeObjToUnixTimestamp = exports.timeObjToSeconds = exports.timeObjFromAny = exports.timeObjFromDate = exports.timeObjFromUnixTimestamp = exports.timeObjFromCalendarObj = void 0;
const luxon_1 = require("luxon");
const timeObjFromCalendarObj = (yearMonthDayHour, timeZone = 'local') => luxon_1.DateTime.fromObject({ ...yearMonthDayHour, zone: timeZone });
exports.timeObjFromCalendarObj = timeObjFromCalendarObj;
const timeObjFromUnixTimestamp = (unixTimestamp, timeZone = 'local') => luxon_1.DateTime.fromMillis(unixTimestamp, { zone: timeZone });
exports.timeObjFromUnixTimestamp = timeObjFromUnixTimestamp;
const timeObjFromDate = (date, timeZone = 'local') => luxon_1.DateTime.fromJSDate(date, { zone: timeZone });
exports.timeObjFromDate = timeObjFromDate;
const timeObjFromAny = (time, timeZone = 'local') => {
    return typeof time === 'number'
        ? (0, exports.timeObjFromUnixTimestamp)(time, timeZone)
        : time instanceof Date
            ? (0, exports.timeObjFromDate)(time, timeZone)
            : (0, exports.timeObjFromCalendarObj)(time, timeZone);
};
exports.timeObjFromAny = timeObjFromAny;
const timeObjToSeconds = (t) => t.toSeconds();
exports.timeObjToSeconds = timeObjToSeconds;
const timeObjToUnixTimestamp = (t) => t.toMillis();
exports.timeObjToUnixTimestamp = timeObjToUnixTimestamp;
const timeObjToWeekday = (t) => t.weekday;
exports.timeObjToWeekday = timeObjToWeekday;
const timeObjToYear = (t) => t.year;
exports.timeObjToYear = timeObjToYear;
const addTimeToObj = (obj, unit, count) => obj.plus({ [unit]: count });
exports.addTimeToObj = addTimeToObj;
const subtractTimeToObj = (obj, unit, count) => obj.minus({ [unit]: count });
exports.subtractTimeToObj = subtractTimeToObj;
const startTimeOfObj = (obj, unit) => obj.startOf(unit);
exports.startTimeOfObj = startTimeOfObj;
const endTimeOfObj = (obj, unit) => obj.endOf(unit);
exports.endTimeOfObj = endTimeOfObj;
const timeObjToUTCOffset = (obj) => obj.offset;
exports.timeObjToUTCOffset = timeObjToUTCOffset;
const formatTimeObj = (obj, format) => obj.toFormat(format);
exports.formatTimeObj = formatTimeObj;
const diffTimeObjs = (obj1, obj2, unit) => obj1.diff(obj2, unit).as(unit);
exports.diffTimeObjs = diffTimeObjs;
//# sourceMappingURL=luxon.js.map