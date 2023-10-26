"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getZoneFromSpecs = exports.getValidatedTimeZone = void 0;
const logger_1 = require("./logger");
const isValidTimeZone = (timeZone) => {
    if (!timeZone)
        return false;
    try {
        Intl.DateTimeFormat(undefined, { timeZone });
        return true;
    }
    catch (error) {
        logger_1.Logger.warn(`The supplied timeZone ${timeZone} does not exist. The default time zone will be used.`);
        logger_1.Logger.warn(error);
        return false;
    }
};
const getValidatedTimeZone = (specifiedTimeZone) => specifiedTimeZone && isValidTimeZone(specifiedTimeZone)
    ? specifiedTimeZone
    : Intl.DateTimeFormat().resolvedOptions().timeZone;
exports.getValidatedTimeZone = getValidatedTimeZone;
const getZoneFromSpecs = (specs) => {
    const allValidTimezones = new Set(specs.map((s) => { var _a; return (_a = s.timeZone) !== null && _a !== void 0 ? _a : ''; }).filter(isValidTimeZone));
    return allValidTimezones.size === 1
        ? allValidTimezones.values().next().value
        : Intl.DateTimeFormat().resolvedOptions().timeZone;
};
exports.getZoneFromSpecs = getZoneFromSpecs;
//# sourceMappingURL=time_zone.js.map