"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMomentWithTz = void 0;
var moment_timezone_1 = __importDefault(require("moment-timezone"));
function getMomentWithTz(date, timeZone) {
    if (timeZone === 'local' || !timeZone) {
        return (0, moment_timezone_1.default)(date);
    }
    if (timeZone.toLowerCase().startsWith('utc+') || timeZone.toLowerCase().startsWith('utc-')) {
        return (0, moment_timezone_1.default)(date).utcOffset(Number(timeZone.slice(3)));
    }
    return moment_timezone_1.default.tz(date, timeZone);
}
exports.getMomentWithTz = getMomentWithTz;
//# sourceMappingURL=date_time.js.map