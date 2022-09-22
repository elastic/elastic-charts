"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var entryKey = function (_a) {
    var _b = __read(_a, 1), key = _b[0];
    return key;
};
exports.entryKey = entryKey;
var entryValue = function (_a) {
    var _b = __read(_a, 2), value = _b[1];
    return value;
};
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
    var index = node[exports.SORT_INDEX_KEY];
    var arrayEntry = node[exports.PARENT_KEY][exports.CHILDREN_KEY][index];
    return (0, exports.entryKey)(arrayEntry);
}
exports.getNodeName = getNodeName;
function groupByRollup(keyAccessors, valueAccessor, _a, factTable) {
    var reducer = _a.reducer, identity = _a.identity;
    var statistics = {
        globalAggregate: NaN,
    };
    var reductionMap = factTable.reduce(function (p, n, index) {
        var keyCount = keyAccessors.length;
        var pointer = p;
        keyAccessors.forEach(function (keyAccessor, i) {
            var _a, _b;
            var _c, _d, _e;
            var key = keyAccessor(n, index);
            var last = i === keyCount - 1;
            var node = pointer.get(key);
            var inputIndices = (_c = node === null || node === void 0 ? void 0 : node[exports.INPUT_KEY]) !== null && _c !== void 0 ? _c : [];
            var childrenMap = (_d = node === null || node === void 0 ? void 0 : node[exports.CHILDREN_KEY]) !== null && _d !== void 0 ? _d : new Map();
            var aggregate = (_e = node === null || node === void 0 ? void 0 : node[exports.AGGREGATE_KEY]) !== null && _e !== void 0 ? _e : identity();
            var reductionValue = reducer(aggregate, valueAccessor(n));
            pointer.set(key, __assign((_a = {}, _a[exports.AGGREGATE_KEY] = reductionValue, _a[exports.STATISTICS_KEY] = statistics, _a[exports.INPUT_KEY] = __spreadArray(__spreadArray([], __read(inputIndices), false), [index], false), _a[exports.DEPTH_KEY] = i, _a), (!last && (_b = {}, _b[exports.CHILDREN_KEY] = childrenMap, _b))));
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
    var _a;
    var children = [];
    var bootstrap = (_a = {},
        _a[exports.AGGREGATE_KEY] = NaN,
        _a[exports.DEPTH_KEY] = NaN,
        _a[exports.CHILDREN_KEY] = children,
        _a[exports.INPUT_KEY] = [],
        _a[exports.PATH_KEY] = [],
        _a[exports.SORT_INDEX_KEY] = 0,
        _a[exports.STATISTICS_KEY] = { globalAggregate: 0 },
        _a);
    bootstrap[exports.PARENT_KEY] = bootstrap;
    return bootstrap;
}
function mapsToArrays(root, sortSpecs, innerGroups) {
    var groupByMap = function (node, parent) {
        var items = Array.from(node, function (_a) {
            var _b, _c;
            var _d = __read(_a, 2), key = _d[0], value = _d[1];
            var valueElement = value[exports.CHILDREN_KEY];
            var resultNode = (_b = {},
                _b[exports.AGGREGATE_KEY] = NaN,
                _b[exports.STATISTICS_KEY] = { globalAggregate: NaN },
                _b[exports.CHILDREN_KEY] = [],
                _b[exports.DEPTH_KEY] = NaN,
                _b[exports.SORT_INDEX_KEY] = NaN,
                _b[exports.PARENT_KEY] = parent,
                _b[exports.INPUT_KEY] = [],
                _b[exports.PATH_KEY] = [],
                _b);
            var newValue = Object.assign(resultNode, value, valueElement && (_c = {}, _c[exports.CHILDREN_KEY] = groupByMap(valueElement, resultNode), _c));
            return [key, newValue];
        });
        if (sortSpecs.some(function (s) { return s !== null; })) {
            items.sort(function (e1, e2) {
                var node1 = e1[1];
                var node2 = e2[1];
                if (node1[exports.DEPTH_KEY] !== node2[exports.DEPTH_KEY])
                    return node1[exports.DEPTH_KEY] - node2[exports.DEPTH_KEY];
                var depth = node1[exports.DEPTH_KEY];
                var sorterWithinLayer = sortSpecs[depth];
                return sorterWithinLayer ? sorterWithinLayer(e1, e2) : node2.value - node1.value;
            });
        }
        return items.map(function (n, i) {
            (0, exports.entryValue)(n).sortIndex = i;
            return n;
        });
    };
    var tree = groupByMap(root, getRootArrayNode());
    var buildPaths = function (_a, currentPath) {
        var _b = __read(_a, 2), key = _b[0], mapNode = _b[1];
        var newPath = __spreadArray(__spreadArray([], __read(currentPath), false), [{ index: mapNode[exports.SORT_INDEX_KEY], value: key }], false);
        mapNode[exports.PATH_KEY] = newPath;
        mapNode.children.forEach(function (entry) { return buildPaths(entry, newPath); });
    };
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
        identity: function () { return 0; },
        reducer: function () { return 1; },
    },
    count: {
        identity: function () { return 0; },
        reducer: function (r) { return r + 1; },
    },
    sum: {
        identity: function () { return 0; },
        reducer: function (r, n) { return r + n; },
    },
    min: {
        identity: function () { return Infinity; },
        reducer: function (r, n) { return Math.min(r, n); },
    },
    max: {
        identity: function () { return -Infinity; },
        reducer: function (r, n) { return Math.max(r, n); },
    },
    min0: {
        identity: function () { return 0; },
        reducer: function (r, n) { return Math.min(r, n); },
    },
    max0: {
        identity: function () { return 0; },
        reducer: function (r, n) { return Math.max(r, n); },
    },
};
//# sourceMappingURL=group_by_rollup.js.map