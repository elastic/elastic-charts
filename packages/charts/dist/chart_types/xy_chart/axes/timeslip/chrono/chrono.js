"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTime = exports.epochDaysInMonth = exports.epochInSecondsToYear = exports.propsFromCalendarObj = void 0;
const chrono_luxon_1 = require("./chrono_luxon/chrono_luxon");
const propsFromCalendarObj = (calendarObj, timeZone) => {
    const t = (0, chrono_luxon_1.timeObjFromCalendarObj)(calendarObj, timeZone);
    return [(0, chrono_luxon_1.timeObjToSeconds)(t), (0, chrono_luxon_1.timeObjToWeekday)(t)];
};
exports.propsFromCalendarObj = propsFromCalendarObj;
const epochInSecondsToYear = (timeZone, seconds) => (0, chrono_luxon_1.timeObjToYear)((0, chrono_luxon_1.timeObjFromEpochSeconds)(timeZone, seconds));
exports.epochInSecondsToYear = epochInSecondsToYear;
const epochDaysInMonth = (timeZone, seconds) => (0, chrono_luxon_1.timeObjFromEpochSeconds)(timeZone, seconds).daysInMonth;
exports.epochDaysInMonth = epochDaysInMonth;
const addTime = (calendarObj, timeZone, unit, count) => (0, chrono_luxon_1.timeObjToSeconds)((0, chrono_luxon_1.addTimeToObj)((0, chrono_luxon_1.timeObjFromCalendarObj)(calendarObj, timeZone), unit, count));
exports.addTime = addTime;
//# sourceMappingURL=chrono.js.map