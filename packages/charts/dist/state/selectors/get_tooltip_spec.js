"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipSpecSelector = void 0;
const get_specs_1 = require("./get_specs");
const chart_types_1 = require("../../chart_types");
const constants_1 = require("../../specs/constants");
const tooltip_1 = require("../../specs/tooltip");
const create_selector_1 = require("../create_selector");
const utils_1 = require("../utils");
exports.getTooltipSpecSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs], (specs) => {
    const tooltipSpec = (0, utils_1.getSpecFromStore)(specs, chart_types_1.ChartType.Global, constants_1.SpecType.Tooltip, false);
    return tooltipSpec !== null && tooltipSpec !== void 0 ? tooltipSpec : tooltip_1.DEFAULT_TOOLTIP_SPEC;
});
//# sourceMappingURL=get_tooltip_spec.js.map