"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorScale = void 0;
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const band_color_scale_1 = require("../../scales/band_color_scale");
exports.getColorScale = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector, get_heatmap_spec_1.getHeatmapSpecSelector], ({ locale }, spec) => (0, band_color_scale_1.getBandsColorScale)(spec.colorScale, locale, spec.valueFormatter));
//# sourceMappingURL=get_color_scale.js.map