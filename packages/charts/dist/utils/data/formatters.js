"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.niceTimeFormatByDay = exports.niceTimeFormatter = exports.timeFormatter = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const date_time_1 = require("./date_time");
function timeFormatter(format) {
    return (value, options) => (0, date_time_1.getMomentWithTz)(value, options && options.timeZone).format(format);
}
exports.timeFormatter = timeFormatter;
function niceTimeFormatter(domain) {
    const minDate = (0, moment_timezone_1.default)(domain[0]);
    const maxDate = (0, moment_timezone_1.default)(domain[1]);
    const diff = maxDate.diff(minDate, 'days');
    const format = niceTimeFormatByDay(diff);
    return timeFormatter(format);
}
exports.niceTimeFormatter = niceTimeFormatter;
function niceTimeFormatByDay(days) {
    if (days > 30)
        return 'YYYY-MM-DD';
    if (days > 7)
        return 'MMMM DD';
    if (days > 1)
        return 'MM-DD HH:mm';
    return 'HH:mm:ss';
}
exports.niceTimeFormatByDay = niceTimeFormatByDay;
//# sourceMappingURL=formatters.js.map