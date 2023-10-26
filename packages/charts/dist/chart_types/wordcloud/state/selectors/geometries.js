"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geometries = void 0;
const scenegraph_1 = require("./scenegraph");
const __1 = require("../../..");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_specs_1 = require("../../../../state/selectors/get_specs");
const utils_1 = require("../../../../state/utils");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const getParentDimensions = (state) => state.parentDimensions;
exports.geometries = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs, get_chart_theme_1.getChartThemeSelector, getParentDimensions], (specs, theme, parentDimensions) => {
    const wordcloudSpec = (0, utils_1.getSpecFromStore)(specs, __1.ChartType.Wordcloud, constants_1.SpecType.Series, false);
    return wordcloudSpec ? (0, scenegraph_1.render)(wordcloudSpec, theme, parentDimensions) : (0, viewmodel_types_1.nullShapeViewModel)();
});
//# sourceMappingURL=geometries.js.map