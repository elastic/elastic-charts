"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrees = void 0;
const get_partition_specs_1 = require("./get_partition_specs");
const __1 = require("../../..");
const predicate_1 = require("../../../../common/predicate");
const specs_1 = require("../../../../specs");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const get_small_multiples_spec_1 = require("../../../../state/selectors/get_small_multiples_spec");
const get_specs_1 = require("../../../../state/selectors/get_specs");
const utils_1 = require("../../../../state/utils");
const group_by_rollup_1 = require("../../layout/utils/group_by_rollup");
const hierarchy_of_arrays_1 = require("../../layout/viewmodel/hierarchy_of_arrays");
const getGroupBySpecs = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Global, specs_1.SpecType.IndexOrder));
function getTreesForSpec(spec, smSpecs, groupBySpecs, locale) {
    var _a, _b, _c, _d;
    const { layout, data, valueAccessor, layers, smallMultiples: smId } = spec;
    const smSpec = smSpecs.find((s) => s.id === smId);
    const smStyle = {
        horizontalPanelPadding: smSpec
            ? (_b = (_a = smSpec.style) === null || _a === void 0 ? void 0 : _a.horizontalPanelPadding) !== null && _b !== void 0 ? _b : specs_1.DEFAULT_SM_PANEL_PADDING
            : { outer: 0, inner: 0 },
        verticalPanelPadding: smSpec
            ? (_d = (_c = smSpec.style) === null || _c === void 0 ? void 0 : _c.verticalPanelPadding) !== null && _d !== void 0 ? _d : specs_1.DEFAULT_SM_PANEL_PADDING
            : { outer: 0, inner: 0 },
    };
    const groupBySpec = groupBySpecs.find((s) => s.id === (smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitHorizontally) || s.id === (smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitVertically) || s.id === (smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitZigzag));
    if (groupBySpec) {
        const { by, sort, format = (name) => String(name) } = groupBySpec;
        const accessorSpec = { id: spec.id, chartType: spec.chartType, specType: specs_1.SpecType.Series };
        const groups = data.reduce((map, next) => {
            const groupingValue = by(accessorSpec, next);
            const preexistingGroup = map.get(groupingValue);
            const group = preexistingGroup !== null && preexistingGroup !== void 0 ? preexistingGroup : [];
            if (!preexistingGroup)
                map.set(groupingValue, group);
            group.push(next);
            return map;
        }, new Map());
        return [...groups].sort((0, predicate_1.getPredicateFn)(sort, locale)).map(([groupKey, subData], innerIndex) => ({
            name: format(groupKey),
            smAccessorValue: groupKey,
            style: smStyle,
            tree: (0, hierarchy_of_arrays_1.partitionTree)(subData, valueAccessor, layers, layout, [{ index: innerIndex, value: String(groupKey) }]),
        }));
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
exports.getTrees = (0, create_selector_1.createCustomCachedSelector)([get_partition_specs_1.getPartitionSpecs, get_small_multiples_spec_1.getSmallMultiplesSpecs, getGroupBySpecs, get_settings_spec_1.getSettingsSpecSelector], ([spec], smallMultiplesSpecs, groupBySpecs, { locale }) => spec ? getTreesForSpec(spec, smallMultiplesSpecs, groupBySpecs, locale) : []);
//# sourceMappingURL=tree.js.map