"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrees = void 0;
var __1 = require("../../..");
var predicate_1 = require("../../../../common/predicate");
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var get_small_multiples_spec_1 = require("../../../../state/selectors/get_small_multiples_spec");
var get_specs_1 = require("../../../../state/selectors/get_specs");
var utils_1 = require("../../../../state/utils");
var group_by_rollup_1 = require("../../layout/utils/group_by_rollup");
var hierarchy_of_arrays_1 = require("../../layout/viewmodel/hierarchy_of_arrays");
var get_partition_specs_1 = require("./get_partition_specs");
var getGroupBySpecs = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], function (specs) {
    return (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Global, specs_1.SpecType.IndexOrder);
});
function getTreesForSpec(spec, smSpecs, groupBySpecs) {
    var _a, _b, _c, _d;
    var layout = spec.layout, data = spec.data, valueAccessor = spec.valueAccessor, layers = spec.layers, smId = spec.smallMultiples;
    var smSpec = smSpecs.find(function (s) { return s.id === smId; });
    var smStyle = {
        horizontalPanelPadding: smSpec
            ? (_b = (_a = smSpec.style) === null || _a === void 0 ? void 0 : _a.horizontalPanelPadding) !== null && _b !== void 0 ? _b : specs_1.DEFAULT_SM_PANEL_PADDING
            : { outer: 0, inner: 0 },
        verticalPanelPadding: smSpec
            ? (_d = (_c = smSpec.style) === null || _c === void 0 ? void 0 : _c.verticalPanelPadding) !== null && _d !== void 0 ? _d : specs_1.DEFAULT_SM_PANEL_PADDING
            : { outer: 0, inner: 0 },
    };
    var groupBySpec = groupBySpecs.find(function (s) { return s.id === (smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitHorizontally) || s.id === (smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitVertically) || s.id === (smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitZigzag); });
    if (groupBySpec) {
        var by_1 = groupBySpec.by, sort = groupBySpec.sort, _e = groupBySpec.format, format_1 = _e === void 0 ? function (name) { return String(name); } : _e;
        var accessorSpec_1 = { id: spec.id, chartType: spec.chartType, specType: specs_1.SpecType.Series };
        var groups = data.reduce(function (map, next) {
            var groupingValue = by_1(accessorSpec_1, next);
            var preexistingGroup = map.get(groupingValue);
            var group = preexistingGroup !== null && preexistingGroup !== void 0 ? preexistingGroup : [];
            if (!preexistingGroup)
                map.set(groupingValue, group);
            group.push(next);
            return map;
        }, new Map());
        return __spreadArray([], __read(groups), false).sort((0, predicate_1.getPredicateFn)(sort)).map(function (_a, innerIndex) {
            var _b = __read(_a, 2), groupKey = _b[0], subData = _b[1];
            return ({
                name: format_1(groupKey),
                smAccessorValue: groupKey,
                style: smStyle,
                tree: (0, hierarchy_of_arrays_1.partitionTree)(subData, valueAccessor, layers, layout, [{ index: innerIndex, value: String(groupKey) }]),
            });
        });
    }
    else {
        return [
            {
                name: '',
                smAccessorValue: '',
                style: smStyle,
                tree: (0, hierarchy_of_arrays_1.partitionTree)(data, valueAccessor, layers, layout, [
                    {
                        index: 0,
                        value: group_by_rollup_1.NULL_SMALL_MULTIPLES_KEY,
                    },
                ]),
            },
        ];
    }
}
exports.getTrees = (0, create_selector_1.createCustomCachedSelector)([get_partition_specs_1.getPartitionSpecs, get_small_multiples_spec_1.getSmallMultiplesSpecs, getGroupBySpecs], function (partitionSpecs, smallMultiplesSpecs, groupBySpecs) {
    return partitionSpecs.length > 0 ? getTreesForSpec(partitionSpecs[0], smallMultiplesSpecs, groupBySpecs) : [];
});
//# sourceMappingURL=tree.js.map