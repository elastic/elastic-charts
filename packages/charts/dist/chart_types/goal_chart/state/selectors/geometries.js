"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrimitiveGeoms = exports.geometries = void 0;
var __1 = require("../../..");
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_specs_1 = require("../../../../state/selectors/get_specs");
var utils_1 = require("../../../../state/utils");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var geoms_1 = require("../../layout/viewmodel/geoms");
var scenegraph_1 = require("./scenegraph");
var getParentDimensions = function (state) { return state.parentDimensions; };
exports.geometries = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs, getParentDimensions, get_chart_theme_1.getChartThemeSelector], function (specs, parentDimensions, theme) {
    var goalSpecs = (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Goal, constants_1.SpecType.Series);
    return goalSpecs.length === 1 ? (0, scenegraph_1.render)(goalSpecs[0], parentDimensions, theme) : (0, viewmodel_types_1.nullShapeViewModel)(theme);
});
exports.getPrimitiveGeoms = (0, create_selector_1.createCustomCachedSelector)([exports.geometries, getParentDimensions], function (shapeViewModel, parentDimensions) {
    var chartCenter = shapeViewModel.chartCenter, bulletViewModel = shapeViewModel.bulletViewModel, theme = shapeViewModel.theme;
    return (0, geoms_1.geoms)(bulletViewModel, theme, parentDimensions, chartCenter);
});
//# sourceMappingURL=geometries.js.map