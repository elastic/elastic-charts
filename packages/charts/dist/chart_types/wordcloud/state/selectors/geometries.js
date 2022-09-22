"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geometries = void 0;
var __1 = require("../../..");
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_specs_1 = require("../../../../state/selectors/get_specs");
var utils_1 = require("../../../../state/utils");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var scenegraph_1 = require("./scenegraph");
var getParentDimensions = function (state) { return state.parentDimensions; };
exports.geometries = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs, get_chart_theme_1.getChartThemeSelector, getParentDimensions], function (specs, theme, parentDimensions) {
    var wordcloudSpecs = (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Wordcloud, constants_1.SpecType.Series);
    return wordcloudSpecs.length === 1 ? (0, scenegraph_1.render)(wordcloudSpecs[0], theme, parentDimensions) : (0, viewmodel_types_1.nullShapeViewModel)();
});
//# sourceMappingURL=geometries.js.map