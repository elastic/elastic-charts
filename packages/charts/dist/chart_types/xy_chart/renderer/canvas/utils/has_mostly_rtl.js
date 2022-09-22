"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMostlyRTL = void 0;
var common_1 = require("../../../../../utils/common");
function hasMostlyRTL(geoms) {
    var labels = geoms.flatMap(function (_a) {
        var axesGeoms = _a.axesGeoms;
        return axesGeoms.flatMap(function (_a) {
            var visibleTicks = _a.visibleTicks;
            return visibleTicks
                .filter(function (_a) {
                var value = _a.value, label = _a.label;
                return typeof value === 'string' && label !== '';
            })
                .map(function (_a) {
                var label = _a.label;
                return label;
            });
        });
    });
    return (0, common_1.hasMostlyRTLItems)(labels);
}
exports.hasMostlyRTL = hasMostlyRTL;
//# sourceMappingURL=has_mostly_rtl.js.map