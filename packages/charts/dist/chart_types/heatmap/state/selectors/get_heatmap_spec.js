"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatmapSpecSelector = void 0;
var __1 = require("../../..");
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var get_specs_1 = require("../../../../state/selectors/get_specs");
var utils_1 = require("../../../../state/utils");
exports.getHeatmapSpecSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], function (specs) {
    var spec = (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Heatmap, specs_1.SpecType.Series);
    return spec[0];
});
//# sourceMappingURL=get_heatmap_spec.js.map