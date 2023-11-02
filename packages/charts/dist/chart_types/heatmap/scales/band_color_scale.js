"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBandsColorScale = void 0;
const colors_1 = require("../../../common/colors");
const predicate_1 = require("../../../common/predicate");
const common_1 = require("../../../utils/common");
function defaultColorBandFormatter(valueFormatter) {
    return (startValue, endValue) => {
        const finiteStart = Number.isFinite(startValue);
        const finiteEnd = Number.isFinite(endValue);
        const start = (0, common_1.safeFormat)(startValue, valueFormatter);
        const end = (0, common_1.safeFormat)(endValue, valueFormatter);
        return !finiteStart && finiteEnd ? `< ${end}` : finiteStart && !finiteEnd ? `≥ ${start}` : `${start} - ${end}`;
    };
}
function getBandsColorScale(colorScale, locale, valueFormatter) {
    var _a;
    const labelFormatter = (_a = colorScale.labelFormatter) !== null && _a !== void 0 ? _a : defaultColorBandFormatter(valueFormatter);
    const ascendingSortFn = (0, predicate_1.getPredicateFn)('numAsc', locale, 'start');
    const bands = colorScale.bands
        .reduce((acc, { start, end, color, label }) => {
        if (start < end)
            acc.push({ start, end, color, label: label !== null && label !== void 0 ? label : labelFormatter(start, end) });
        return acc;
    }, [])
        .sort(ascendingSortFn);
    const scale = getBandScale(bands);
    return { scale, bands };
}
exports.getBandsColorScale = getBandsColorScale;
function getBandScale(bands) {
    return (value) => {
        var _a, _b;
        if (!(0, common_1.isFiniteNumber)(value)) {
            return colors_1.Colors.Transparent.keyword;
        }
        return (_b = (_a = bands.find(({ start, end }) => start <= value && value < end)) === null || _a === void 0 ? void 0 : _a.color) !== null && _b !== void 0 ? _b : colors_1.Colors.Transparent.keyword;
    };
}
//# sourceMappingURL=band_color_scale.js.map