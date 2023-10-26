"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKENS = exports.diffTimeObjs = exports.formatTimeObj = exports.timeObjToUTCOffset = exports.endTimeOfObj = exports.startTimeOfObj = exports.subtractTimeToObj = exports.addTimeToObj = exports.timeObjToYear = exports.timeObjToWeekday = exports.timeObjToUnixTimestamp = exports.timeObjToSeconds = exports.timeObjFromAny = exports.timeObjFromDate = exports.timeObjFromUnixTimestamp = exports.timeObjFromCalendarObj = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const timeObjFromCalendarObj = (yearMonthDayHour, timeZone = 'browser') => timeZone
    ? moment_timezone_1.default.tz({
        ...yearMonthDayHour,
        month: typeof yearMonthDayHour.month === 'number' ? yearMonthDayHour.month - 1 : undefined,
    }, timeZone)
    : (0, moment_timezone_1.default)({
        ...yearMonthDayHour,
        month: typeof yearMonthDayHour.month === 'number' ? yearMonthDayHour.month - 1 : undefined,
    });
exports.timeObjFromCalendarObj = timeObjFromCalendarObj;
const timeObjFromUnixTimestamp = (unixTimestamp, timeZone) => timeZone ? moment_timezone_1.default.tz(unixTimestamp, timeZone) : (0, moment_timezone_1.default)(unixTimestamp);
exports.timeObjFromUnixTimestamp = timeObjFromUnixTimestamp;
const timeObjFromDate = (date, timeZone) => timeZone ? moment_timezone_1.default.tz(date, timeZone) : (0, moment_timezone_1.default)(date);
exports.timeObjFromDate = timeObjFromDate;
const timeObjFromAny = (time, timeZone) => {
    return typeof time === 'number'
        ? (0, exports.timeObjFromUnixTimestamp)(time, timeZone)
        : time instanceof Date
            ? (0, exports.timeObjFromDate)(time, timeZone)
            : (0, exports.timeObjFromCalendarObj)(time, timeZone);
};
exports.timeObjFromAny = timeObjFromAny;
const timeObjToSeconds = (t) => t.unix();
exports.timeObjToSeconds = timeObjToSeconds;
const timeObjToUnixTimestamp = (t) => t.valueOf();
exports.timeObjToUnixTimestamp = timeObjToUnixTimestamp;
const timeObjToWeekday = (t) => t.isoWeekday();
exports.timeObjToWeekday = timeObjToWeekday;
const timeObjToYear = (t) => t.year();
exports.timeObjToYear = timeObjToYear;
const addTimeToObj = (obj, unit, count) => obj.add(count, unit);
exports.addTimeToObj = addTimeToObj;
const subtractTimeToObj = (obj, unit, count) => obj.subtract(count, unit);
exports.subtractTimeToObj = subtractTimeToObj;
const startTimeOfObj = (obj, unit) => obj.startOf(unit === 'week' ? 'isoWeek' : unit);
exports.startTimeOfObj = startTimeOfObj;
const endTimeOfObj = (obj, unit) => obj.endOf(unit === 'week' ? 'isoWeek' : unit);
exports.endTimeOfObj = endTimeOfObj;
const timeObjToUTCOffset = (obj) => obj.utcOffset();
exports.timeObjToUTCOffset = timeObjToUTCOffset;
const formatTimeObj = (obj, format) => obj.format(format);
exports.formatTimeObj = formatTimeObj;
const diffTimeObjs = (obj1, obj2, unit) => obj1.diff(obj2, unit);
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