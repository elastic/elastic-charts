"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregators = exports.mapEntryValue = exports.mapsToArrays = exports.groupByRollup = exports.getNodeName = exports.pathAccessor = exports.sortIndexAccessor = exports.childrenAccessor = exports.parentAccessor = exports.aggregateAccessor = exports.depthAccessor = exports.entryValue = exports.entryKey = exports.HIERARCHY_ROOT_KEY = exports.NULL_SMALL_MULTIPLES_KEY = exports.PATH_KEY = exports.SORT_INDEX_KEY = exports.PARENT_KEY = exports.INPUT_KEY = exports.CHILDREN_KEY = exports.DEPTH_KEY = exports.STATISTICS_KEY = exports.AGGREGATE_KEY = void 0;
exports.AGGREGATE_KEY = 'value';
exports.STATISTICS_KEY = 'statistics';
exports.DEPTH_KEY = 'depth';
exports.CHILDREN_KEY = 'children';
exports.INPUT_KEY = 'inputIndex';
exports.PARENT_KEY = 'parent';
exports.SORT_INDEX_KEY = 'sortIndex';
exports.PATH_KEY = 'path';
exports.NULL_SMALL_MULTIPLES_KEY = '__null_small_multiples_key__';
exports.HIERARCHY_ROOT_KEY = '__root_key__';
const entryKey = ([key]) => key;
exports.entryKey = entryKey;
const entryValue = ([, value]) => value;
exports.entryValue = entryValue;
function depthAccessor(n) {
    return (0, exports.entryValue)(n)[exports.DEPTH_KEY];
}
exports.depthAccessor = depthAccessor;
function aggregateAccessor(n) {
    return (0, exports.entryValue)(n)[exports.AGGREGATE_KEY];
}
exports.aggregateAccessor = aggregateAccessor;
function parentAccessor(n) {
    return (0, exports.entryValue)(n)[exports.PARENT_KEY];
}
exports.parentAccessor = parentAccessor;
function childrenAccessor(n) {
    return (0, exports.entryValue)(n)[exports.CHILDREN_KEY];
}
exports.childrenAccessor = childrenAccessor;
function sortIndexAccessor(n) {
    return (0, exports.entryValue)(n)[exports.SORT_INDEX_KEY];
}
exports.sortIndexAccessor = sortIndexAccessor;
function pathAccessor(n) {
    return (0, exports.entryValue)(n)[exports.PATH_KEY];
}
exports.pathAccessor = pathAccessor;
function getNodeName(node) {
    const index = node[exports.SORT_INDEX_KEY];
    const arrayEntry = node[exports.PARENT_KEY][exports.CHILDREN_KEY][index];
    return arrayEntry ? (0, exports.entryKey)(arrayEntry) : '';
}
exports.getNodeName = getNodeName;
function groupByRollup(keyAccessors, valueAccessor, { reducer, identity, }, factTable) {
    const statistics = {
        globalAggregate: NaN,
    };
    const reductionMap = factTable.reduce((p, n, index) => {
        const keyCount = keyAccessors.length;
        let pointer = p;
        keyAccessors.forEach((keyAccessor, i) => {
            var _a, _b, _c;
            const key = keyAccessor(n, index);
            const last = i === keyCount - 1;
            const node = pointer.get(key);
            const inputIndices = (_a = node === null || node === void 0 ? void 0 : node[exports.INPUT_KEY]) !== null && _a !== void 0 ? _a : [];
            const childrenMap = (_b = node === null || node === void 0 ? void 0 : node[exports.CHILDREN_KEY]) !== null && _b !== void 0 ? _b : new Map();
            const aggregate = (_c = node === null || node === void 0 ? void 0 : node[exports.AGGREGATE_KEY]) !== null && _c !== void 0 ? _c : identity();
            const reductionValue = reducer(aggregate, valueAccessor(n));
            pointer.set(key, {
                [exports.AGGREGATE_KEY]: reductionValue,
                [exports.STATISTICS_KEY]: statistics,
                [exports.INPUT_KEY]: [...inputIndices, index],
                [exports.DEPTH_KEY]: i,
                ...(!last && { [exports.CHILDREN_KEY]: childrenMap }),
            });
            if (childrenMap) {
                pointer = childrenMap;
            }
        });
        return p;
    }, new Map());
    if (reductionMap.get(exports.HIERARCHY_ROOT_KEY) !== undefined) {
        statistics.globalAggregate = reductionMap.get(exports.HIERARCHY_ROOT_KEY)[exports.AGGREGATE_KEY];
    }
    return reductionMap;
}
exports.groupByRollup = groupByRollup;
function getRootArrayNode() {
    const children = [];
    const bootstrap = {
        [exports.AGGREGATE_KEY]: NaN,
        [exports.DEPTH_KEY]: NaN,
        [exports.CHILDREN_KEY]: children,
        [exports.INPUT_KEY]: [],
        [exports.PATH_KEY]: [],
        [exports.SORT_INDEX_KEY]: 0,
        [exports.STATISTICS_KEY]: { globalAggregate: 0 },
    };
    bootstrap[exports.PARENT_KEY] = bootstrap;
    return bootstrap;
}
function mapsToArrays(root, sortSpecs, innerGroups) {
    const groupByMap = (node, parent) => {
        const items = Array.from(node, ([key, value]) => {
            const valueElement = value[exports.CHILDREN_KEY];
            const resultNode = {
                [exports.AGGREGATE_KEY]: NaN,
                [exports.STATISTICS_KEY]: { globalAggregate: NaN },
                [exports.CHILDREN_KEY]: [],
                [exports.DEPTH_KEY]: NaN,
                [exports.SORT_INDEX_KEY]: NaN,
                [exports.PARENT_KEY]: parent,
                [exports.INPUT_KEY]: [],
                [exports.PATH_KEY]: [],
            };
            const newValue = Object.assign(resultNode, value, valueElement && { [exports.CHILDREN_KEY]: groupByMap(valueElement, resultNode) });
            return [key, newValue];
        });
        if (sortSpecs.some((s) => s !== null)) {
            items.sort((e1, e2) => {
                const node1 = e1[1];
                const node2 = e2[1];
                if (node1[exports.DEPTH_KEY] !== node2[exports.DEPTH_KEY])
                    return node1[exports.DEPTH_KEY] - node2[exports.DEPTH_KEY];
                const depth = node1[exports.DEPTH_KEY];
                const sorterWithinLayer = sortSpecs[depth];
                return sorterWithinLayer ? sorterWithinLayer(e1, e2) : node2.value - node1.value;
            });
        }
        return items.map((n, i) => {
            (0, exports.entryValue)(n).sortIndex = i;
            return n;
        });
    };
    const tree = groupByMap(root, getRootArrayNode());
    const buildPaths = ([key, mapNode], currentPath) => {
        const newPath = [...currentPath, { index: mapNode[exports.SORT_INDEX_KEY], value: key }];
        mapNode[exports.PATH_KEY] = newPath;
        mapNode.children.forEach((entry) => buildPaths(entry, newPath));
    };
    if (tree[0])
        buildPaths(tree[0], innerGroups);
    return tree;
}
exports.mapsToArrays = mapsToArrays;
function mapEntryValue(entry) {
    return (0, exports.entryValue)(entry)[exports.AGGREGATE_KEY];
}
exports.mapEntryValue = mapEntryValue;
exports.aggregators = {
    one: {
        identity: () => 0,
        reducer: () => 1,
    },
    count: {
        identity: () => 0,
        reducer: (r) => r + 1,
    },
    sum: {
        identity: () => 0,
        reducer: (r, n) => r + n,
    },
    min: {
        identity: () => Infinity,
        reducer: (r, n) => Math.min(r, n),
    },
    max: {
        identity: () => -Infinity,
        reducer: (r, n) => Math.max(r, n),
    },
    min0: {
        identity: () => 0,
        reducer: (r, n) => Math.min(r, n),
    },
    max0: {
        identity: () => 0,
        reducer: (r, n) => Math.max(r, n),
    },
};
//# sourceMappingURL=group_by_rollup.js.map