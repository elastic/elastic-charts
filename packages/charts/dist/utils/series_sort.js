"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipCompareFn = exports.getLegendCompareFn = exports.getRenderingCompareFn = void 0;
var DEFAULT_SORTING_FN = function () { return 0; };
var getRenderingCompareFn = function (defaultSortFn) {
    if (defaultSortFn === void 0) { defaultSortFn = DEFAULT_SORTING_FN; }
    return defaultSortFn;
};
exports.getRenderingCompareFn = getRenderingCompareFn;
var getLegendCompareFn = function (defaultSortFn) {
    if (defaultSortFn === void 0) { defaultSortFn = DEFAULT_SORTING_FN; }
    return defaultSortFn;
};
exports.getLegendCompareFn = getLegendCompareFn;
var getTooltipCompareFn = function (defaultSortFn) {
    if (defaultSortFn === void 0) { defaultSortFn = DEFAULT_SORTING_FN; }
    return defaultSortFn;
};
exports.getTooltipCompareFn = getTooltipCompareFn;
//# sourceMappingURL=series_sort.js.map