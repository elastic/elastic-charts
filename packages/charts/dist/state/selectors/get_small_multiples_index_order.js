"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmallMultiplesIndexOrderSelector = void 0;
const get_specs_1 = require("./get_specs");
const chart_types_1 = require("../../chart_types");
const specs_1 = require("../../specs");
const create_selector_1 = require("../create_selector");
const utils_1 = require("../utils");
exports.getSmallMultiplesIndexOrderSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => {
    const [smallMultiples] = (0, utils_1.getSpecsFromStore)(specs, chart_types_1.ChartType.Global, specs_1.SpecType.SmallMultiples);
    const groupBySpecs = (0, utils_1.getSpecsFromStore)(specs, chart_types_1.ChartType.Global, specs_1.SpecType.IndexOrder);
    return {
        horizontal: groupBySpecs.find((s) => s.id === (smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.splitHorizontally)),
        vertical: groupBySpecs.find((s) => s.id === (smallMultiples === null || smallMultiples === void 0 ? void 0 : smallMultiples.splitVertically)),
    };
});
//# sourceMappingURL=get_small_multiples_index_order.js.map