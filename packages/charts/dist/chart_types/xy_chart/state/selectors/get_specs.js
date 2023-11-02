"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotationSpecsSelector = exports.getSeriesSpecsSelector = exports.axisSpecsLookupSelector = exports.getAxisSpecsSelector = void 0;
const __1 = require("../../..");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_specs_1 = require("../../../../state/selectors/get_specs");
const utils_1 = require("../../../../state/utils");
exports.getAxisSpecsSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.XYAxis, constants_1.SpecType.Axis));
exports.axisSpecsLookupSelector = (0, create_selector_1.createCustomCachedSelector)(exports.getAxisSpecsSelector, (axisSpecs) => axisSpecs.reduce((acc, spec) => acc.set(spec.id, spec), new Map()));
exports.getSeriesSpecsSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => {
    return (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.XYAxis, constants_1.SpecType.Series);
});
exports.getAnnotationSpecsSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.XYAxis, constants_1.SpecType.Annotation));
//# sourceMappingURL=get_specs.js.map