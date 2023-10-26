"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtraValueMap = exports.partitionTree = exports.getHierarchyOfArrays = void 0;
const viewmodel_1 = require("./viewmodel");
const group_by_rollup_1 = require("../utils/group_by_rollup");
function aggregateComparator(accessor, sorter) {
    return (a, b) => sorter(accessor(a), accessor(b));
}
const ascending = (a, b) => a - b;
const descending = (a, b) => b - a;
const childOrders = {
    ascending,
    descending,
};
const descendingValueNodes = aggregateComparator(group_by_rollup_1.mapEntryValue, childOrders.descending);
const ascendingValueNodes = aggregateComparator(group_by_rollup_1.mapEntryValue, childOrders.ascending);
function getHierarchyOfArrays(rawFacts, valueAccessor, groupByRollupAccessors, sortSpecs, innerGroups) {
    const aggregator = group_by_rollup_1.aggregators.sum;
    const facts = rawFacts.filter((n) => {
        const value = valueAccessor(n);
        return Number.isFinite(value) && value >= 0;
    });
    if (facts.reduce((p, n) => aggregator.reducer(p, valueAccessor(n)), aggregator.identity()) <= 0) {
        return [];
    }
    return (0, group_by_rollup_1.mapsToArrays)((0, group_by_rollup_1.groupByRollup)(groupByRollupAccessors, valueAccessor, aggregator, facts), sortSpecs, innerGroups);
}
exports.getHierarchyOfArrays = getHierarchyOfArrays;
const sorter = (layout) => ({ sortPredicate }, i) => sortPredicate ||
    ((0, viewmodel_1.isTreemap)(layout) || (0, viewmodel_1.isSunburst)(layout) || (0, viewmodel_1.isWaffle)(layout)
        ? descendingValueNodes
        : (0, viewmodel_1.isMosaic)(layout)
            ? i === 2
                ? ascendingValueNodes
                : descendingValueNodes
            : null);
function partitionTree(data, valueAccessor, layers, layout, innerGroups) {
    return getHierarchyOfArrays(data, valueAccessor, [() => group_by_rollup_1.HIERARCHY_ROOT_KEY, ...layers.map(({ groupByRollup }) => groupByRollup)], [null, ...layers.map(sorter(layout))], innerGroups);
}
exports.partitionTree = partitionTree;
function getExtraValueMap(layers, valueFormatter, tree, maxDepth, depth = 0, keys = new Map()) {
    for (let i = 0; i < tree.length; i++) {
        const branch = tree[i];
        if (!branch)
            continue;
        const [key, arrayNode] = branch;
        const { value, path, [group_by_rollup_1.CHILDREN_KEY]: children } = arrayNode;
        const values = new Map();
        const formattedValue = valueFormatter ? valueFormatter(value) : value;
        values.set(key, formattedValue);
        keys.set(path.map(({ index }) => index).join('__'), values);
        if (depth < maxDepth)
            getExtraValueMap(layers, valueFormatter, children, maxDepth, depth + 1, keys);
    }
    return keys;
}
exports.getExtraValueMap = getExtraValueMap;
//# sourceMappingURL=hierarchy_of_arrays.js.map