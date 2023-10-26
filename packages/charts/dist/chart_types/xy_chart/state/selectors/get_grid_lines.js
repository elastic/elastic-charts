"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGridLinesSelector = void 0;
const compute_axes_geometries_1 = require("./compute_axes_geometries");
const get_specs_1 = require("./get_specs");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const grid_lines_1 = require("../../utils/grid_lines");
exports.getGridLinesSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getAxisSpecsSelector, compute_axes_geometries_1.computeAxesGeometriesSelector, get_chart_theme_1.getChartThemeSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], grid_lines_1.getGridLines);
//# sourceMappingURL=get_grid_lines.js.map