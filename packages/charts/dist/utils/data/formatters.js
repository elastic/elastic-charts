"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.niceTimeFormatByDay = exports.niceTimeFormatter = exports.timeFormatter = void 0;
var moment_timezone_1 = __importDefault(require("moment-timezone"));
var date_time_1 = require("./date_time");
function timeFormatter(format) {
    return function (value, options) {
        return (0, date_time_1.getMomentWithTz)(value, options && options.timeZone).format(format);
    };
}
exports.timeFormatter = timeFormatter;
function niceTimeFormatter(domain) {
    var minDate = (0, moment_timezone_1.default)(domain[0]);
    var maxDate = (0, moment_timezone_1.default)(domain[1]);
    var diff = maxDate.diff(minDate, 'days');
    var format = niceTimeFormatByDay(diff);
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