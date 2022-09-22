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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreenReaderDataSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var group_by_rollup_1 = require("../../layout/utils/group_by_rollup");
var geometries_1 = require("./geometries");
var get_partition_specs_1 = require("./get_partition_specs");
var getScreenReaderDataForPartitions = function (_a, shapeViewModels) {
    var _b = __read(_a, 1), valueFormatter = _b[0].valueFormatter;
    return shapeViewModels.flatMap(function (_a) {
        var quadViewModel = _a.quadViewModel, layers = _a.layers, panel = _a.panel;
        return quadViewModel.map(function (_a) {
            var _b, _c, _d, _e, _f, _g;
            var depth = _a.depth, value = _a.value, dataName = _a.dataName, parent = _a.parent, path = _a.path;
            var label = (_d = (_c = (_b = layers[depth - 1]) === null || _b === void 0 ? void 0 : _b.nodeLabel) === null || _c === void 0 ? void 0 : _c.call(_b, dataName)) !== null && _d !== void 0 ? _d : dataName;
            var parentValue = path.length > 1 ? path[path.length - 2].value : undefined;
            var parentName = depth > 1 && parentValue ? (_g = (_f = (_e = layers[depth - 2]) === null || _e === void 0 ? void 0 : _e.nodeLabel) === null || _f === void 0 ? void 0 : _f.call(_e, parentValue)) !== null && _g !== void 0 ? _g : path[path.length - 1].value : 'none';
            return {
                panelTitle: panel.title,
                depth: depth,
                label: label,
                parentName: parentName,
                percentage: "".concat(Math.round((value / parent[group_by_rollup_1.STATISTICS_KEY].globalAggregate) * 100), "%"),
                value: value,
                valueText: valueFormatter ? valueFormatter(value) : "".concat(value),
            };
        });
    });
};
exports.getScreenReaderDataSelector = (0, create_selector_1.createCustomCachedSelector)([get_partition_specs_1.getPartitionSpecs, geometries_1.partitionMultiGeometries], function (specs, shapeViewModel) {
    if (specs.length === 0) {
        return {
            hasMultipleLayers: false,
            isSmallMultiple: false,
            data: [],
        };
    }
    return {
        hasMultipleLayers: specs[0].layers.length > 1,
        isSmallMultiple: shapeViewModel.length > 1,
        data: getScreenReaderDataForPartitions(specs, shapeViewModel),
    };
});
//# sourceMappingURL=get_screen_reader_data.js.map