"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diff = exports.formatTime = exports.getUTCOffset = exports.endOf = exports.startOf = exports.getUnixTimestamp = exports.subtractTime = exports.addTime = void 0;
const moment_1 = require("./moment");
function addTime(dateTime, timeZone, unit, count) {
    return (0, moment_1.timeObjToUnixTimestamp)((0, moment_1.addTimeToObj)(getTimeObj(dateTime, timeZone), unit, count));
}
exports.addTime = addTime;
function subtractTime(dateTime, timeZone, unit, count) {
    return (0, moment_1.timeObjToUnixTimestamp)((0, moment_1.subtractTimeToObj)(getTimeObj(dateTime, timeZone), unit, count));
}
exports.subtractTime = subtractTime;
function getUnixTimestamp(dateTime, timeZone) {
    return (0, moment_1.timeObjToUnixTimestamp)(getTimeObj(dateTime, timeZone));
}
exports.getUnixTimestamp = getUnixTimestamp;
function startOf(dateTime, timeZone, unit) {
    return (0, moment_1.timeObjToUnixTimestamp)((0, moment_1.startTimeOfObj)(getTimeObj(dateTime, timeZone), unit));
}
exports.startOf = startOf;
function endOf(dateTime, timeZone, unit) {
    return (0, moment_1.timeObjToUnixTimestamp)((0, moment_1.endTimeOfObj)(getTimeObj(dateTime, timeZone), unit));
}
exports.endOf = endOf;
function getTimeObj(dateTime, timeZone) {
    return (0, moment_1.timeObjFromAny)(dateTime, timeZone);
}
function getUTCOffset(dateTime, timeZone) {
    return (0, moment_1.timeObjToUTCOffset)(getTimeObj(dateTime, timeZone));
}
exports.getUTCOffset = getUTCOffset;
function formatTime(dateTime, timeZone, format) {
    return (0, moment_1.formatTimeObj)(getTimeObj(dateTime, timeZone), format);
}
exports.formatTime = formatTime;
function diff(dateTime1, timeZone1, dateTime2, timeZone2, unit) {
    return (0, moment_1.diffTimeObjs)(getTimeObj(dateTime1, timeZone1), getTimeObj(dateTime2, timeZone2), unit);
}
exports.diff = diff;
//# sourceMappingURL=chrono.js.map