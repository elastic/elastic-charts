"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItemsLabels = void 0;
const get_partition_specs_1 = require("./get_partition_specs");
const tree_1 = require("./tree");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const legend_labels_1 = require("../../layout/utils/legend_labels");
exports.getLegendItemsLabels = (0, create_selector_1.createCustomCachedSelector)([get_partition_specs_1.getPartitionSpecs, get_settings_spec_1.getSettingsSpecSelector, tree_1.getTrees], (specs, { legendMaxDepth, showLegend, showLegendExtra }, trees) => specs.flatMap(({ layers, valueFormatter }) => showLegend
    ? trees.flatMap(({ tree }) => (0, legend_labels_1.getLegendLabelsAndValue)(layers, tree, legendMaxDepth, showLegendExtra ? valueFormatter : () => ''))
    : []));
//# sourceMappingURL=get_legend_items_labels.js.map