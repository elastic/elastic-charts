"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmallMultiplesSpec = exports.getSmallMultiplesSpecs = void 0;
var chart_types_1 = require("../../chart_types");
var constants_1 = require("../../specs/constants");
var create_selector_1 = require("../create_selector");
var utils_1 = require("../utils");
var get_specs_1 = require("./get_specs");
exports.getSmallMultiplesSpecs = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], function (specs) {
    return (0, utils_1.getSpecsFromStore)(specs, chart_types_1.ChartType.Global, constants_1.SpecType.SmallMultiples);
});
exports.getSmallMultiplesSpec = (0, create_selector_1.createCustomCachedSelector)([exports.getSmallMultiplesSpecs], function (smallMultiples) {
    return smallMultiples.length === 1 ? smallMultiples : undefined;
});
//# sourceMappingURL=get_small_multiples_spec.js.map