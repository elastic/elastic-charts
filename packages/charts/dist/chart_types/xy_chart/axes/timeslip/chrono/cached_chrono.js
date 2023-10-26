"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachedTimeDelta = exports.cachedZonedDateTimeFrom = exports.TimeProp = exports.timeProp = void 0;
const chrono_1 = require("./chrono");
const timeProps = ['epochSeconds', 'dayOfWeek'];
exports.timeProp = Object.fromEntries(timeProps.map((propName, i) => [propName, i]));
exports.TimeProp = Object.freeze({
    EpochSeconds: 0,
    DayOfWeek: 1,
});
const zonedDateTimeFromCache = {};
const cachedZonedDateTimeFrom = (temporalArgs) => {
    const { timeZone, year, month, day, hour = 0 } = temporalArgs;
    const key = `_${year}_${month}_${day}_${hour}_${timeZone}`;
    const cachedValue = zonedDateTimeFromCache[key];
    if (cachedValue) {
        return cachedValue;
    }
    const result = (0, chrono_1.propsFromCalendarObj)({ year, month, day, hour }, timeZone);
    zonedDateTimeFromCache[key] = result;
    return result;
};
exports.cachedZonedDateTimeFrom = cachedZonedDateTimeFrom;
const deltaTimeCache = {};
const cachedTimeDelta = (temporalArgs, unit, count) => {
    const { timeZone, year, month, day } = temporalArgs;
    const key = `_${year}_${month}_${day}_${timeZone}_${count}_${unit}`;
    const cachedValue = deltaTimeCache[key];
    if (cachedValue) {
        return cachedValue;
    }
    const result = (0, chrono_1.addTime)({ year, month, day }, timeZone, unit, count);
    deltaTimeCache[key] = result;
    return result;
};
exports.cachedTimeDelta = cachedTimeDelta;
//# sourceMappingURL=cached_chrono.js.map