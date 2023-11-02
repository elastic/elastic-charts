"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drilldownActive = void 0;
const partition_spec_1 = require("./partition_spec");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
exports.drilldownActive = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpecs, get_chart_theme_1.getChartThemeSelector], (specs, { partition }) => {
    return specs.length === 1 && specs[0] && (0, viewmodel_1.isSimpleLinear)(specs[0].layout, partition.fillLabel, specs[0].layers);
});
//# sourceMappingURL=drilldown_active.js.map