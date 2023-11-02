"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipCompareFn = exports.getLegendCompareFn = exports.getRenderingCompareFn = void 0;
const DEFAULT_SORTING_FN = () => 0;
const getRenderingCompareFn = (defaultSortFn = DEFAULT_SORTING_FN) => defaultSortFn;
exports.getRenderingCompareFn = getRenderingCompareFn;
const getLegendCompareFn = (defaultSortFn = DEFAULT_SORTING_FN) => defaultSortFn;
exports.getLegendCompareFn = getLegendCompareFn;
const getTooltipCompareFn = (defaultSortFn = DEFAULT_SORTING_FN) => defaultSortFn;
exports.getTooltipCompareFn = getTooltipCompareFn;
//# sourceMappingURL=series_sort.js.map