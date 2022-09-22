"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinearNonDenserTicks = void 0;
var get_linear_ticks_1 = require("../chart_types/xy_chart/utils/get_linear_ticks");
function getLinearNonDenserTicks(start, stop, count, base, minInterval) {
    var currentCount = count;
    var ticks = (0, get_linear_ticks_1.getLinearTicks)(start, stop, count, base);
    while (ticks.length > 2 && currentCount > 0 && ticks[1] - ticks[0] < minInterval) {
        currentCount--;
        ticks = (0, get_linear_ticks_1.getLinearTicks)(start, stop, currentCount, base);
    }
    return ticks;
}
exports.getLinearNonDenserTicks = getLinearNonDenserTicks;
//# sourceMappingURL=utils.js.map