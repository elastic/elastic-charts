"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drilldownActive = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var viewmodel_1 = require("../../layout/viewmodel/viewmodel");
var partition_spec_1 = require("./partition_spec");
exports.drilldownActive = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpecs, get_chart_theme_1.getChartThemeSelector], function (specs, _a) {
    var partition = _a.partition;
    return specs.length === 1 && (0, viewmodel_1.isSimpleLinear)(specs[0].layout, partition.fillLabel, specs[0].layers);
});
//# sourceMappingURL=drilldown_active.js.map