"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorScale = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var band_color_scale_1 = require("../../scales/band_color_scale");
var get_heatmap_spec_1 = require("./get_heatmap_spec");
exports.getColorScale = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector], function (spec) { return (0, band_color_scale_1.getBandsColorScale)(spec.colorScale, spec.valueFormatter); });
//# sourceMappingURL=get_color_scale.js.map