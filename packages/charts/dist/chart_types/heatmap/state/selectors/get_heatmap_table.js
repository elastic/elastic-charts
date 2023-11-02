"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatmapTableSelector = void 0;
const d3_array_1 = require("d3-array");
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const predicate_1 = require("../../../../common/predicate");
const constants_1 = require("../../../../scales/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const get_small_multiples_index_order_1 = require("../../../../state/selectors/get_small_multiples_index_order");
const accessor_1 = require("../../../../utils/accessor");
const elasticsearch_1 = require("../../../../utils/chrono/elasticsearch");
const common_1 = require("../../../../utils/common");
exports.getHeatmapTableSelector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, get_settings_spec_1.getSettingsSpecSelector, get_small_multiples_index_order_1.getSmallMultiplesIndexOrderSelector], (spec, { xDomain, locale }, smallMultiples) => {
    var _a, _b, _c, _d, _e, _f;
    const { data, valueAccessor, xAccessor, yAccessor, xSortPredicate, ySortPredicate, xScale, timeZone } = spec;
    const smVValues = new Set();
    const smHValues = new Set();
    const resultData = data.reduce((acc, curr, index) => {
        var _a, _b, _c, _d;
        const x = (0, accessor_1.getAccessorValue)(curr, xAccessor);
        const y = (0, accessor_1.getAccessorValue)(curr, yAccessor);
        const value = (0, accessor_1.getAccessorValue)(curr, valueAccessor);
        if (!(0, common_1.isNonNullablePrimitiveValue)(x) || !(0, common_1.isNonNullablePrimitiveValue)(y)) {
            return acc;
        }
        if ((0, common_1.isFiniteNumber)(value)) {
            acc.extent = [Math.min(acc.extent[0], value), Math.max(acc.extent[1], value)];
            const smH = (_b = (_a = smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.horizontal) === null || _a === void 0 ? void 0 : _a.by) === null || _b === void 0 ? void 0 : _b.call(_a, spec, curr);
            const smV = (_d = (_c = smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.vertical) === null || _c === void 0 ? void 0 : _c.by) === null || _d === void 0 ? void 0 : _d.call(_c, spec, curr);
            if (!(0, common_1.isNil)(smH))
                smHValues.add(smH);
            if (!(0, common_1.isNil)(smV))
                smVValues.add(smV);
            acc.table.push({
                x,
                y,
                value,
                originalIndex: index,
                smVerticalAccessorValue: smV,
                smHorizontalAccessorValue: smH,
            });
        }
        if (!acc.xValues.includes(x)) {
            acc.xValues.push(x);
        }
        if (!acc.yValues.includes(y)) {
            acc.yValues.push(y);
        }
        return acc;
    }, {
        table: [],
        xValues: [],
        yValues: [],
        smHDomain: [],
        smVDomain: [],
        extent: [+Infinity, -Infinity],
        xNumericExtent: [+Infinity, -Infinity],
    });
    if (xScale.type === constants_1.ScaleType.Time) {
        const [xDataMin = NaN, xDataMax = NaN] = (0, d3_array_1.extent)(resultData.xValues);
        const dataMaxExtended = xDataMax ? (0, elasticsearch_1.addIntervalToTime)(xDataMax, xScale.interval, timeZone) : NaN;
        const [customMin, customMax] = !Array.isArray(xDomain) ? [(_a = xDomain === null || xDomain === void 0 ? void 0 : xDomain.min) !== null && _a !== void 0 ? _a : NaN, (_b = xDomain === null || xDomain === void 0 ? void 0 : xDomain.max) !== null && _b !== void 0 ? _b : NaN] : [NaN, NaN];
        const [min, max] = (0, d3_array_1.extent)([xDataMin, customMin, customMax, dataMaxExtended]);
        resultData.xNumericExtent = [min !== null && min !== void 0 ? min : NaN, max !== null && max !== void 0 ? max : NaN];
        resultData.xValues =
            (0, common_1.isFiniteNumber)(min) && (0, common_1.isFiniteNumber)(max) ? (0, elasticsearch_1.timeRange)(min, max, xScale.interval, timeZone) : [];
    }
    else if (xScale.type === constants_1.ScaleType.Ordinal) {
        resultData.xValues.sort((0, predicate_1.getPredicateFn)(xSortPredicate, locale));
    }
    resultData.yValues.sort((0, predicate_1.getPredicateFn)(ySortPredicate, locale));
    const horizontalPredicate = (_d = (_c = smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.horizontal) === null || _c === void 0 ? void 0 : _c.sort) !== null && _d !== void 0 ? _d : predicate_1.Predicate.DataIndex;
    const smHDomain = [...smHValues].sort((0, predicate_1.getPredicateFn)(horizontalPredicate, locale));
    const verticalPredicate = (_f = (_e = smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.vertical) === null || _e === void 0 ? void 0 : _e.sort) !== null && _f !== void 0 ? _f : predicate_1.Predicate.DataIndex;
    const smVDomain = [...smVValues].sort((0, predicate_1.getPredicateFn)(verticalPredicate, locale));
    return {
        ...resultData,
        smHDomain,
        smVDomain,
    };
});
//# sourceMappingURL=get_heatmap_table.js.map