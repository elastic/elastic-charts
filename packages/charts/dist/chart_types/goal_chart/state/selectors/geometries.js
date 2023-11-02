"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrimitiveGeoms = exports.geometries = void 0;
const scenegraph_1 = require("./scenegraph");
const __1 = require("../../..");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_specs_1 = require("../../../../state/selectors/get_specs");
const utils_1 = require("../../../../state/utils");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const geoms_1 = require("../../layout/viewmodel/geoms");
const getParentDimensions = (state) => state.parentDimensions;
exports.geometries = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs, getParentDimensions, get_chart_theme_1.getChartThemeSelector], (specs, parentDimensions, theme) => {
    const goalSpec = (0, utils_1.getSpecFromStore)(specs, __1.ChartType.Goal, constants_1.SpecType.Series, false);
    return goalSpec ? (0, scenegraph_1.render)(goalSpec, parentDimensions, theme) : (0, viewmodel_types_1.nullShapeViewModel)(theme);
});
exports.getPrimitiveGeoms = (0, create_selector_1.createCustomCachedSelector)([exports.geometries, getParentDimensions], (shapeViewModel, parentDimensions) => {
    const { chartCenter, bulletViewModel, theme } = shapeViewModel;
    return (0, geoms_1.geoms)(bulletViewModel, theme, parentDimensions, chartCenter);
});
//# sourceMappingURL=geometries.js.map