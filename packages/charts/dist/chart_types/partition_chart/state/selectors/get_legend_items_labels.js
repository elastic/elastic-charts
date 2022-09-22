"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItemsLabels = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var legend_labels_1 = require("../../layout/utils/legend_labels");
var get_partition_specs_1 = require("./get_partition_specs");
var tree_1 = require("./tree");
exports.getLegendItemsLabels = (0, create_selector_1.createCustomCachedSelector)([get_partition_specs_1.getPartitionSpecs, get_settings_spec_1.getSettingsSpecSelector, tree_1.getTrees], function (specs, _a, trees) {
    var legendMaxDepth = _a.legendMaxDepth, showLegend = _a.showLegend, showLegendExtra = _a.showLegendExtra;
    return specs.flatMap(function (_a) {
        var layers = _a.layers, valueFormatter = _a.valueFormatter;
        return showLegend
            ? trees.flatMap(function (_a) {
                var tree = _a.tree;
                return (0, legend_labels_1.getLegendLabelsAndValue)(layers, tree, legendMaxDepth, showLegendExtra ? valueFormatter : function () { return ''; });
            })
            : [];
    });
});
//# sourceMappingURL=get_legend_items_labels.js.map