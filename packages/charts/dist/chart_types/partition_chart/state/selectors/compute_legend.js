"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLegendSelector = void 0;
const get_partition_specs_1 = require("./get_partition_specs");
const tree_1 = require("./tree");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const colors_1 = require("../../../../common/colors");
const create_selector_1 = require("../../../../state/create_selector");
const get_legend_config_selector_1 = require("../../../../state/selectors/get_legend_config_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const common_1 = require("../../../../utils/common");
const legend_1 = require("../../../../utils/legend");
const config_types_1 = require("../../layout/types/config_types");
const group_by_rollup_1 = require("../../layout/utils/group_by_rollup");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
function compareLegendItemNames(aItem, bItem, locale) {
    return aItem.item.label.localeCompare(bItem.item.label, locale);
}
function compareDescendingLegendItemValues(aItem, bItem) {
    var _a, _b;
    return ((_a = aItem.item.depth) !== null && _a !== void 0 ? _a : -1) - ((_b = bItem.item.depth) !== null && _b !== void 0 ? _b : -1) || bItem.node[group_by_rollup_1.AGGREGATE_KEY] - aItem.node[group_by_rollup_1.AGGREGATE_KEY];
}
exports.computeLegendSelector = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, get_partition_specs_1.getPartitionSpecs, get_legend_config_selector_1.getLegendConfigSelector, tree_1.getTrees], (settings, [spec], { flatLegend, legendMaxDepth, legendPosition }, trees) => {
    if (!spec)
        return [];
    const sortingFn = flatLegend && settings.legendSort;
    const { locale } = settings;
    return trees.flatMap((tree) => {
        const customSortingFn = sortingFn
            ? (aItem, bItem) => {
                var _a, _b, _c, _d;
                return sortingFn({
                    smAccessorValue: tree.smAccessorValue,
                    specId: (_a = aItem.item.seriesIdentifiers[0]) === null || _a === void 0 ? void 0 : _a.specId,
                    key: (_b = aItem.item.seriesIdentifiers[0]) === null || _b === void 0 ? void 0 : _b.key,
                }, {
                    smAccessorValue: tree.smAccessorValue,
                    specId: (_c = bItem.item.seriesIdentifiers[0]) === null || _c === void 0 ? void 0 : _c.specId,
                    key: (_d = bItem.item.seriesIdentifiers[0]) === null || _d === void 0 ? void 0 : _d.key,
                });
            }
            : undefined;
        const useHierarchicalLegend = (0, legend_1.isHierarchicalLegend)(flatLegend, legendPosition);
        const { valueFormatter } = spec;
        const items = walkTree(spec.id, useHierarchicalLegend, valueFormatter, tree.tree, spec.layers, 0);
        return items
            .filter((d) => {
            var _a;
            const depth = (_a = d.item.depth) !== null && _a !== void 0 ? _a : -1;
            if (d.item.childId === group_by_rollup_1.HIERARCHY_ROOT_KEY) {
                return false;
            }
            return depth < legendMaxDepth;
        })
            .sort(customSortingFn !== null && customSortingFn !== void 0 ? customSortingFn : (spec.layout === config_types_1.PartitionLayout.waffle
            ? compareDescendingLegendItemValues
            : (0, viewmodel_1.isLinear)(spec.layout)
                ? (a, b) => compareLegendItemNames(a, b, locale)
                : () => 0))
            .map(({ item }) => item);
    });
});
function walkTree(specId, useHierarchicalLegend, valueFormatter, tree, layers, depth, uniqueNames = new Set(), legendItems = []) {
    var _a, _b, _c;
    if (tree.length === 0) {
        return legendItems;
    }
    for (const [key, node] of tree) {
        const layer = layers[depth - 1];
        const formatter = (_a = layer === null || layer === void 0 ? void 0 : layer.nodeLabel) !== null && _a !== void 0 ? _a : ((d) => `${d}`);
        const fill = (_c = (_b = layer === null || layer === void 0 ? void 0 : layer.shape) === null || _b === void 0 ? void 0 : _b.fillColor) !== null && _c !== void 0 ? _c : (0, color_library_wrappers_1.RGBATupleToString)(colors_1.Colors.DarkOpaqueRed.rgba);
        const fillColor = typeof fill === 'function' ? fill(key, node.sortIndex, node, tree) : fill;
        const label = formatter(key);
        const joinedPath = node[group_by_rollup_1.PATH_KEY].map((d) => d.value).join('##');
        const uniqueKey = `${depth}--${joinedPath}--${label}--${fillColor}--${node[group_by_rollup_1.AGGREGATE_KEY]}`;
        if (!(0, common_1.isNil)(key) && !uniqueNames.has(uniqueKey)) {
            legendItems.push({
                item: {
                    color: fillColor,
                    childId: key,
                    label,
                    path: node[group_by_rollup_1.PATH_KEY],
                    depth: node[group_by_rollup_1.DEPTH_KEY] - 1,
                    seriesIdentifiers: [{ key, specId }],
                    keys: [],
                    defaultExtra: {
                        raw: node[group_by_rollup_1.AGGREGATE_KEY],
                        formatted: valueFormatter(node[group_by_rollup_1.AGGREGATE_KEY]),
                        legendSizingLabel: `${node[group_by_rollup_1.AGGREGATE_KEY]}`,
                    },
                },
                node,
            });
            uniqueNames.add(uniqueKey);
        }
        const children = node[group_by_rollup_1.CHILDREN_KEY];
        walkTree(specId, useHierarchicalLegend, valueFormatter, children, layers, depth + 1, uniqueNames, legendItems);
    }
    return legendItems;
}
//# sourceMappingURL=compute_legend.js.map