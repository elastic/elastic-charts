"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmallMultiplesIndexOrderSelector = exports.getAnnotationSpecsSelector = exports.getSeriesSpecsSelector = exports.axisSpecsLookupSelector = exports.getAxisSpecsSelector = void 0;
var __1 = require("../../..");
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_specs_1 = require("../../../../state/selectors/get_specs");
var utils_1 = require("../../../../state/utils");
exports.getAxisSpecsSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], function (specs) {
    return (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.XYAxis, constants_1.SpecType.Axis);
});
exports.axisSpecsLookupSelector = (0, create_selector_1.createCustomCachedSelector)(exports.getAxisSpecsSelector, function (axisSpecs) { return axisSpecs.reduce(function (acc, spec) { return acc.set(spec.id, spec); }, new Map()); });
exports.getSeriesSpecsSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], function (specs) {
    return (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.XYAxis, constants_1.SpecType.Series);
});
exports.getAnnotationSpecsSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], function (specs) {
    return (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.XYAxis, constants_1.SpecType.Annotation);
});
exports.getSmallMultiplesIndexOrderSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], function (specs) {
    var _a = __read((0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Global, constants_1.SpecType.SmallMultiples), 1), smallMultiples = _a[0];
    var groupBySpecs = (0, utils_1.getSpecsFromStore)(specs, __1.ChartType.Global, constants_1.SpecType.IndexOrder);
    return {
        horizontal: groupBySpecs.find(function (s) { return s.id === (smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.splitHorizontally); }),
        vertical: groupBySpecs.find(function (s) { return s.id === (smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.splitVertically); }),
    };
});
//# sourceMappingURL=get_specs.js.map