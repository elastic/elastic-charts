"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBandsColorScale = void 0;
var colors_1 = require("../../../common/colors");
var predicate_1 = require("../../../common/predicate");
var common_1 = require("../../../utils/common");
function defaultColorBandFormatter(valueFormatter) {
    return function (startValue, endValue) {
        var finiteStart = Number.isFinite(startValue);
        var finiteEnd = Number.isFinite(endValue);
        var start = (0, common_1.safeFormat)(startValue, valueFormatter);
        var end = (0, common_1.safeFormat)(endValue, valueFormatter);
        return !finiteStart && finiteEnd ? "< ".concat(end) : finiteStart && !finiteEnd ? "\u2265 ".concat(start) : "".concat(start, " - ").concat(end);
    };
}
function getBandsColorScale(colorScale, valueFormatter) {
    var _a;
    var labelFormatter = (_a = colorScale.labelFormatter) !== null && _a !== void 0 ? _a : defaultColorBandFormatter(valueFormatter);
    var ascendingSortFn = (0, predicate_1.getPredicateFn)('numAsc', 'start');
    var bands = colorScale.bands
        .reduce(function (acc, _a) {
        var start = _a.start, end = _a.end, color = _a.color, label = _a.label;
        if (start < end)
            acc.push({ start: start, end: end, color: color, label: label !== null && label !== void 0 ? label : labelFormatter(start, end) });
        return acc;
    }, [])
        .sort(ascendingSortFn);
    var scale = getBandScale(bands);
    return { scale: scale, bands: bands };
}
exports.getBandsColorScale = getBandsColorScale;
function getBandScale(bands) {
    return function (value) {
        if (!(0, common_1.isFiniteNumber)(value)) {
            return colors_1.Colors.Transparent.keyword;
        }
        for (var i = 0; i < bands.length; i++) {
            var _a = bands[i], start = _a.start, end = _a.end, color = _a.color;
            if (start <= value && value < end) {
                return color;
            }
        }
        return colors_1.Colors.Transparent.keyword;
    };
}
//# sourceMappingURL=band_color_scale.js.map