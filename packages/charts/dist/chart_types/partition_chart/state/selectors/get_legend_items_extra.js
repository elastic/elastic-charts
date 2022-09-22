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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItemsExtra = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var hierarchy_of_arrays_1 = require("../../layout/viewmodel/hierarchy_of_arrays");
var partition_spec_1 = require("./partition_spec");
var tree_1 = require("./tree");
exports.getLegendItemsExtra = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpec, get_settings_spec_1.getSettingsSpecSelector, tree_1.getTrees], function (spec, _a, trees) {
    var legendMaxDepth = _a.legendMaxDepth;
    var emptyMap = new Map();
    return spec && !Number.isNaN(legendMaxDepth) && legendMaxDepth > 0
        ? trees.reduce(function (result, _a) {
            var e_1, _b;
            var tree = _a.tree;
            var treeData = (0, hierarchy_of_arrays_1.getExtraValueMap)(spec.layers, spec.valueFormatter, tree, legendMaxDepth);
            try {
                for (var treeData_1 = __values(treeData), treeData_1_1 = treeData_1.next(); !treeData_1_1.done; treeData_1_1 = treeData_1.next()) {
                    var _c = __read(treeData_1_1.value, 2), key = _c[0], value = _c[1];
                    result.set(key, value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (treeData_1_1 && !treeData_1_1.done && (_b = treeData_1.return)) _b.call(treeData_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        }, emptyMap)
        : emptyMap;
});
//# sourceMappingURL=get_legend_items_extra.js.map