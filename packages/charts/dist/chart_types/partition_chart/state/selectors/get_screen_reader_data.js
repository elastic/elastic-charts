"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreenReaderDataSelector = void 0;
const geometries_1 = require("./geometries");
const get_partition_specs_1 = require("./get_partition_specs");
const create_selector_1 = require("../../../../state/create_selector");
const group_by_rollup_1 = require("../../layout/utils/group_by_rollup");
const getScreenReaderDataForPartitions = ([spec], shapeViewModels) => {
    return shapeViewModels.flatMap(({ quadViewModel, layers, panel }) => quadViewModel.map(({ depth, value, dataName, parent, path }) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const label = (_c = (_b = (_a = layers[depth - 1]) === null || _a === void 0 ? void 0 : _a.nodeLabel) === null || _b === void 0 ? void 0 : _b.call(_a, dataName)) !== null && _c !== void 0 ? _c : dataName;
        const parentValue = path.length > 1 ? (_d = path.at(-2)) === null || _d === void 0 ? void 0 : _d.value : undefined;
        const parentName = depth > 1 && parentValue ? (_g = (_f = (_e = layers[depth - 2]) === null || _e === void 0 ? void 0 : _e.nodeLabel) === null || _f === void 0 ? void 0 : _f.call(_e, parentValue)) !== null && _g !== void 0 ? _g : (_h = path.at(-1)) === null || _h === void 0 ? void 0 : _h.value : 'none';
        return {
            panelTitle: panel.title,
            depth,
            label,
            parentName,
            percentage: `${Math.round((value / parent[group_by_rollup_1.STATISTICS_KEY].globalAggregate) * 100)}%`,
            value,
            valueText: (spec === null || spec === void 0 ? void 0 : spec.valueFormatter) ? spec.valueFormatter(value) : `${value}`,
        };
    }));
};
exports.getScreenReaderDataSelector = (0, create_selector_1.createCustomCachedSelector)([get_partition_specs_1.getPartitionSpecs, geometries_1.partitionMultiGeometries], (specs, shapeViewModel) => {
    var _a, _b;
    if (specs.length === 0) {
        return {
            hasMultipleLayers: false,
            isSmallMultiple: false,
            data: [],
        };
    }
    return {
        hasMultipleLayers: ((_b = (_a = specs[0]) === null || _a === void 0 ? void 0 : _a.layers.length) !== null && _b !== void 0 ? _b : NaN) > 1,
        isSmallMultiple: shapeViewModel.length > 1,
        data: getScreenReaderDataForPartitions(specs, shapeViewModel),
    };
});
//# sourceMappingURL=get_screen_reader_data.js.map