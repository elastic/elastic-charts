"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
exports.getLegendLabelsAndValue = void 0;
var group_by_rollup_1 = require("./group_by_rollup");
function getLegendLabelsAndValue(layers, tree, legendMaxDepth, valueFormatter) {
    return flatSlicesNames(layers, 0, tree, valueFormatter).filter(function (_a) {
        var depth = _a.depth;
        return depth <= legendMaxDepth;
    });
}
exports.getLegendLabelsAndValue = getLegendLabelsAndValue;
function getArrayNodeKey(arrayNode) {
    return arrayNode[group_by_rollup_1.PATH_KEY].reduce(function (acc, _a) {
        var value = _a.value, index = _a.index;
        if (value === group_by_rollup_1.HIERARCHY_ROOT_KEY || value === group_by_rollup_1.NULL_SMALL_MULTIPLES_KEY)
            return acc;
        return "".concat(acc, "(").concat(index, "):").concat(value, "__");
    }, '__');
}
function flatSlicesNames(layers, depth, tree, valueFormatter, keys, depths) {
    var e_1, _a;
    if (keys === void 0) { keys = new Map(); }
    if (depths === void 0) { depths = new Map(); }
    if (tree.length === 0) {
        return [];
    }
    try {
        for (var tree_1 = __values(tree), tree_1_1 = tree_1.next(); !tree_1_1.done; tree_1_1 = tree_1.next()) {
            var _b = __read(tree_1_1.value, 2), key = _b[0], arrayNode = _b[1];
            var layer = layers[depth - 1];
            var formatter = layer === null || layer === void 0 ? void 0 : layer.nodeLabel;
            var formattedKey = formatter ? formatter(key) : "".concat(key);
            if (formattedKey && formattedKey !== group_by_rollup_1.HIERARCHY_ROOT_KEY) {
                var nodeKey = getArrayNodeKey(arrayNode);
                depths.set(nodeKey, depth);
                var formattedValue = valueFormatter(arrayNode[group_by_rollup_1.AGGREGATE_KEY]);
                keys.set(nodeKey, "".concat(formattedKey).concat(formattedValue));
            }
            var children = arrayNode[group_by_rollup_1.CHILDREN_KEY];
            flatSlicesNames(layers, depth + 1, children, valueFormatter, keys, depths);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (tree_1_1 && !tree_1_1.done && (_a = tree_1.return)) _a.call(tree_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return __spreadArray([], __read(depths.keys()), false).map(function (key) {
        var _a, _b;
        return ({
            label: (_a = keys.get(key)) !== null && _a !== void 0 ? _a : '',
            depth: (_b = depths.get(key)) !== null && _b !== void 0 ? _b : 0,
        });
    });
}
//# sourceMappingURL=legend_labels.js.map