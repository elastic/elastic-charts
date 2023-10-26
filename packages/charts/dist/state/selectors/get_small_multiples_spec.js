"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmallMultiplesSpec = exports.getSmallMultiplesSpecs = void 0;
const get_specs_1 = require("./get_specs");
const chart_types_1 = require("../../chart_types");
const constants_1 = require("../../specs/constants");
const create_selector_1 = require("../create_selector");
const utils_1 = require("../utils");
exports.getSmallMultiplesSpecs = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => (0, utils_1.getSpecsFromStore)(specs, chart_types_1.ChartType.Global, constants_1.SpecType.SmallMultiples));
exports.getSmallMultiplesSpec = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => (0, utils_1.getSpecFromStore)(specs, chart_types_1.ChartType.Global, constants_1.SpecType.SmallMultiples, false));
//# sourceMappingURL=get_small_multiples_spec.js.map