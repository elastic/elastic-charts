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
exports.getExtraValueMap = exports.partitionTree = exports.getHierarchyOfArrays = void 0;
var group_by_rollup_1 = require("../utils/group_by_rollup");
var viewmodel_1 = require("./viewmodel");
function aggregateComparator(accessor, sorter) {
    return function (a, b) { return sorter(accessor(a), accessor(b)); };
}
var ascending = function (a, b) { return a - b; };
var descending = function (a, b) { return b - a; };
var childOrders = {
    ascending: ascending,
    descending: descending,
};
var descendingValueNodes = aggregateComparator(group_by_rollup_1.mapEntryValue, childOrders.descending);
var ascendingValueNodes = aggregateComparator(group_by_rollup_1.mapEntryValue, childOrders.ascending);
function getHierarchyOfArrays(rawFacts, valueAccessor, groupByRollupAccessors, sortSpecs, innerGroups) {
    var aggregator = group_by_rollup_1.aggregators.sum;
    var facts = rawFacts.filter(function (n) {
        var value = valueAccessor(n);
        return Number.isFinite(value) && value > 0;
    });
    if (facts.reduce(function (p, n) { return aggregator.reducer(p, valueAccessor(n)); }, aggregator.identity()) <= 0) {
        return [];
    }
    return (0, group_by_rollup_1.mapsToArrays)((0, group_by_rollup_1.groupByRollup)(groupByRollupAccessors, valueAccessor, aggregator, facts), sortSpecs, innerGroups);
}
exports.getHierarchyOfArrays = getHierarchyOfArrays;
var sorter = function (layout) {
    return function (_a, i) {
        var sortPredicate = _a.sortPredicate;
        return sortPredicate ||
            ((0, viewmodel_1.isTreemap)(layout) || (0, viewmodel_1.isSunburst)(layout) || (0, viewmodel_1.isWaffle)(layout)
                ? descendingValueNodes
                : (0, viewmodel_1.isMosaic)(layout)
                    ? i === 2
                        ? ascendingValueNodes
                        : descendingValueNodes
                    : null);
    };
};
function partitionTree(data, valueAccessor, layers, layout, innerGroups) {
    return getHierarchyOfArrays(data, valueAccessor, __spreadArray([function () { return group_by_rollup_1.HIERARCHY_ROOT_KEY; }], __read(layers.map(function (_a) {
        var groupByRollup = _a.groupByRollup;
        return groupByRollup;
    })), false), __spreadArray([null], __read(layers.map(sorter(layout))), false), innerGroups);
}
exports.partitionTree = partitionTree;
function getExtraValueMap(layers, valueFormatter, tree, maxDepth, depth, keys) {
    if (depth === void 0) { depth = 0; }
    if (keys === void 0) { keys = new Map(); }
    for (var i = 0; i < tree.length; i++) {
        var branch = tree[i];
        var _a = __read(branch, 2), key = _a[0], arrayNode = _a[1];
        var _b = arrayNode, value = _b.value, path = _b.path, _c = group_by_rollup_1.CHILDREN_KEY, children = _b[_c];
        var values = new Map();
        var formattedValue = valueFormatter ? valueFormatter(value) : value;
        values.set(key, formattedValue);
        keys.set(path.map(function (_a) {
            var index = _a.index;
            return index;
        }).join('__'), values);
        if (depth < maxDepth)
            getExtraValueMap(layers, valueFormatter, children, maxDepth, depth + 1, keys);
    }
    return keys;
}
exports.getExtraValueMap = getExtraValueMap;
//# sourceMappingURL=hierarchy_of_arrays.js.map