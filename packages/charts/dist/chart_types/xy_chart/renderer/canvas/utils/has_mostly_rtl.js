"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMostlyRTL = void 0;
const common_1 = require("../../../../../utils/common");
function hasMostlyRTL(geoms) {
    const labels = geoms.flatMap(({ axesGeoms }) => {
        return axesGeoms.flatMap(({ visibleTicks }) => {
            return visibleTicks
                .filter(({ value, label }) => typeof value === 'string' && label !== '')
                .map(({ label }) => label);
        });
    });
    return (0, common_1.hasMostlyRTLItems)(labels);
}
exports.hasMostlyRTL = hasMostlyRTL;
//# sourceMappingURL=has_mostly_rtl.js.map