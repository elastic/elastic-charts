"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTime = exports.epochInSecondsToYear = exports.propsFromCalendarObj = void 0;
var chrono_luxon_1 = require("./chrono_luxon/chrono_luxon");
var propsFromCalendarObj = function (calendarObj, timeZone) {
    var t = (0, chrono_luxon_1.timeObjFromCalendarObj)(calendarObj, timeZone);
    return [(0, chrono_luxon_1.timeObjToSeconds)(t), (0, chrono_luxon_1.timeObjToWeekday)(t)];
};
exports.propsFromCalendarObj = propsFromCalendarObj;
var epochInSecondsToYear = function (timeZone, seconds) {
    return (0, chrono_luxon_1.timeObjToYear)((0, chrono_luxon_1.timeObjFromEpochSeconds)(timeZone, seconds));
};
exports.epochInSecondsToYear = epochInSecondsToYear;
var addTime = function (calendarObj, timeZone, unit, count) {
    return (0, chrono_luxon_1.timeObjToSeconds)((0, chrono_luxon_1.addTimeToObj)((0, chrono_luxon_1.timeObjFromCalendarObj)(calendarObj, timeZone), unit, count));
};
exports.addTime = addTime;
//# sourceMappingURL=chrono.js.map