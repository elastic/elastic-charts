"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLegendSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_legend_config_selector_1 = require("../../../../state/selectors/get_legend_config_selector");
var legend_1 = require("../../layout/utils/legend");
var geometries_1 = require("./geometries");
var get_partition_specs_1 = require("./get_partition_specs");
exports.computeLegendSelector = (0, create_selector_1.createCustomCachedSelector)([get_partition_specs_1.getPartitionSpecs, get_legend_config_selector_1.getLegendConfigSelector, geometries_1.partitionMultiGeometries], function (specs, _a, geometries) {
    var flatLegend = _a.flatLegend, legendMaxDepth = _a.legendMaxDepth, legendPosition = _a.legendPosition;
    return specs.flatMap(function (partitionSpec, i) {
        var quadViewModel = geometries.filter(function (g) { return g.index === i; }).flatMap(function (g) { return g.quadViewModel; });
        return (0, legend_1.getLegendItems)(partitionSpec.id, partitionSpec.layers, flatLegend, legendMaxDepth, legendPosition, quadViewModel, partitionSpec.layout);
    });
});
//# sourceMappingURL=compute_legend.js.map