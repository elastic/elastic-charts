"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItemsExtra = void 0;
const partition_spec_1 = require("./partition_spec");
const tree_1 = require("./tree");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const hierarchy_of_arrays_1 = require("../../layout/viewmodel/hierarchy_of_arrays");
exports.getLegendItemsExtra = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpec, get_settings_spec_1.getSettingsSpecSelector, tree_1.getTrees], (spec, { legendMaxDepth }, trees) => {
    const emptyMap = new Map();
    return spec && !Number.isNaN(legendMaxDepth) && legendMaxDepth > 0
        ? trees.reduce((result, { tree }) => {
            const treeData = (0, hierarchy_of_arrays_1.getExtraValueMap)(spec.layers, spec.valueFormatter, tree, legendMaxDepth);
            for (const [key, value] of treeData) {
                result.set(key, value);
            }
            return result;
        }, emptyMap)
        : emptyMap;
});
//# sourceMappingURL=get_legend_items_extra.js.map