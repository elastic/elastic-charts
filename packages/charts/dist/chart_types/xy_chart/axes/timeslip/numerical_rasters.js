"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numericalRasters = void 0;
const axis_model_1 = require("../../../timeslip/projections/axis_model");
const numericalLayerCount = 2;
const numericalRasters = ({ minimumTickPixelDistance, locale }) => {
    const numberFormatter = new Intl.NumberFormat(locale, {
        notation: 'standard',
        maximumFractionDigits: 0,
    });
    const format = (value) => numberFormatter.format(value);
    const allRasters = [...new Array(numericalLayerCount)]
        .map((_, i) => ({
        unit: 'one',
        unitMultiplier: Infinity,
        labeled: i === 0,
        minimumTickPixelDistance,
        intervals: (domainFrom, domainTo) => (0, axis_model_1.getDecimalTicks)(domainFrom, domainTo, i === 0 ? 20 : 5, axis_model_1.oneFive).map((d, i, a) => {
            var _a, _b;
            const supremum = i < a.length - 1 ? (_a = a[i + 1]) !== null && _a !== void 0 ? _a : NaN : d + (d - ((_b = a[i - 1]) !== null && _b !== void 0 ? _b : NaN));
            return {
                minimum: d,
                supremum,
                labelSupremum: supremum,
            };
        }),
        detailedLabelFormat: (n) => format((n - 1300000000000) / 1e6),
        minorTickLabelFormat: (n) => format((n - 1300000000000) / 1e6),
    }))
        .reverse();
    return (filter) => {
        const layers = new Set();
        for (const layer of allRasters) {
            if (filter(layer))
                layers.add(layer);
            else
                break;
        }
        return [...layers].reverse();
    };
};
exports.numericalRasters = numericalRasters;
//# sourceMappingURL=numerical_rasters.js.map