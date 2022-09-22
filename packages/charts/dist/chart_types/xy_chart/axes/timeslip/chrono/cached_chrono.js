"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachedTimeDelta = exports.cachedZonedDateTimeFrom = exports.timeProp = void 0;
var chrono_1 = require("./chrono");
var timeProps = ['epochSeconds', 'dayOfWeek'];
exports.timeProp = Object.fromEntries(timeProps.map(function (propName, i) { return [propName, i]; }));
var zonedDateTimeFromCache = {};
var cachedZonedDateTimeFrom = function (temporalArgs) {
    var timeZone = temporalArgs.timeZone, year = temporalArgs.year, month = temporalArgs.month, day = temporalArgs.day, _a = temporalArgs.hour, hour = _a === void 0 ? 0 : _a;
    var key = "_".concat(year, "_").concat(month, "_").concat(day, "_").concat(hour, "_").concat(timeZone);
    var cachedValue = zonedDateTimeFromCache[key];
    if (cachedValue) {
        return cachedValue;
    }
    var result = (0, chrono_1.propsFromCalendarObj)({ year: year, month: month, day: day, hour: hour }, timeZone);
    zonedDateTimeFromCache[key] = result;
    return result;
};
exports.cachedZonedDateTimeFrom = cachedZonedDateTimeFrom;
var deltaTimeCache = {};
var cachedTimeDelta = function (temporalArgs, unit, count) {
    var timeZone = temporalArgs.timeZone, year = temporalArgs.year, month = temporalArgs.month, day = temporalArgs.day;
    var key = "_".concat(year, "_").concat(month, "_").concat(day, "_").concat(timeZone, "_").concat(count, "_").concat(unit);
    var cachedValue = deltaTimeCache[key];
    if (cachedValue) {
        return cachedValue;
    }
    var result = (0, chrono_1.addTime)({ year: year, month: month, day: day }, timeZone, unit, count);
    deltaTimeCache[key] = result;
    return result;
};
exports.cachedTimeDelta = cachedTimeDelta;
//# sourceMappingURL=cached_chrono.js.map