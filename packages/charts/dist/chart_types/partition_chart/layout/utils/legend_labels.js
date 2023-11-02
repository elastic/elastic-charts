"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendLabelsAndValue = void 0;
const group_by_rollup_1 = require("./group_by_rollup");
function getLegendLabelsAndValue(layers, tree, legendMaxDepth, valueFormatter) {
    return flatSlicesNames(layers, 0, tree, valueFormatter).filter(({ depth }) => depth <= legendMaxDepth);
}
exports.getLegendLabelsAndValue = getLegendLabelsAndValue;
function getArrayNodeKey(arrayNode) {
    return arrayNode[group_by_rollup_1.PATH_KEY].reduce((acc, { value, index }) => {
        if (value === group_by_rollup_1.HIERARCHY_ROOT_KEY || value === group_by_rollup_1.NULL_SMALL_MULTIPLES_KEY)
            return acc;
        return `${acc}(${index}):${value}__`;
    }, '__');
}
function flatSlicesNames(layers, depth, tree, valueFormatter, keys = new Map(), depths = new Map()) {
    if (tree.length === 0) {
        return [];
    }
    for (const [key, arrayNode] of tree) {
        const layer = layers[depth - 1];
        const formatter = layer === null || layer === void 0 ? void 0 : layer.nodeLabel;
        const formattedKey = formatter ? formatter(key) : `${key}`;
        if (formattedKey && formattedKey !== group_by_rollup_1.HIERARCHY_ROOT_KEY) {
            const nodeKey = getArrayNodeKey(arrayNode);
            depths.set(nodeKey, depth);
            const formattedValue = valueFormatter(arrayNode[group_by_rollup_1.AGGREGATE_KEY]);
            keys.set(nodeKey, `${formattedKey}${formattedValue}`);
        }
        const children = arrayNode[group_by_rollup_1.CHILDREN_KEY];
        flatSlicesNames(layers, depth + 1, children, valueFormatter, keys, depths);
    }
    return [...depths.keys()].map((key) => {
        var _a, _b;
        return ({
            label: (_a = keys.get(key)) !== null && _a !== void 0 ? _a : '',
            depth: (_b = depths.get(key)) !== null && _b !== void 0 ? _b : 0,
        });
    });
}
//# sourceMappingURL=legend_labels.js.map