"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGridLinesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var grid_lines_1 = require("../../utils/grid_lines");
var compute_axes_geometries_1 = require("./compute_axes_geometries");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
var get_specs_1 = require("./get_specs");
exports.getGridLinesSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getAxisSpecsSelector, compute_axes_geometries_1.computeAxesGeometriesSelector, get_chart_theme_1.getChartThemeSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], grid_lines_1.getGridLines);
//# sourceMappingURL=get_grid_lines.js.map