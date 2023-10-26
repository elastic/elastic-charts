"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinearNonDenserTicks = void 0;
const get_linear_ticks_1 = require("../chart_types/xy_chart/utils/get_linear_ticks");
function getLinearNonDenserTicks(start, stop, count, base, minInterval) {
    var _a, _b;
    let currentCount = count;
    let ticks = (0, get_linear_ticks_1.getLinearTicks)(start, stop, count, base);
    while (ticks.length > 2 && currentCount > 0 && ((_a = ticks[1]) !== null && _a !== void 0 ? _a : NaN) - ((_b = ticks[0]) !== null && _b !== void 0 ? _b : NaN) < minInterval) {
        currentCount--;
        ticks = (0, get_linear_ticks_1.getLinearTicks)(start, stop, currentCount, base);
    }
    return ticks;
}
exports.getLinearNonDenserTicks = getLinearNonDenserTicks;
//# sourceMappingURL=utils.js.map