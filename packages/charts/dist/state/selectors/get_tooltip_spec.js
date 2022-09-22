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
exports.getTooltipSpecSelector = void 0;
var chart_types_1 = require("../../chart_types");
var constants_1 = require("../../specs/constants");
var tooltip_1 = require("../../specs/tooltip");
var common_1 = require("../../utils/common");
var create_selector_1 = require("../create_selector");
var utils_1 = require("../utils");
var get_settings_spec_1 = require("./get_settings_spec");
var get_specs_1 = require("./get_specs");
exports.getTooltipSpecSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSpecs, get_settings_spec_1.getSettingsSpecSelector], function (specs, settings) {
    if (settings.tooltip) {
        var legacyProps = isTooltipProps(settings.tooltip) ? settings.tooltip : { type: settings.tooltip };
        return (0, common_1.mergePartial)(tooltip_1.DEFAULT_TOOLTIP_SPEC, legacyProps);
    }
    var _a = __read((0, utils_1.getSpecsFromStore)(specs, chart_types_1.ChartType.Global, constants_1.SpecType.Tooltip), 1), tooltipSpec = _a[0];
    return tooltipSpec !== null && tooltipSpec !== void 0 ? tooltipSpec : tooltip_1.DEFAULT_TOOLTIP_SPEC;
});
function isTooltipProps(tooltipSettings) {
    return typeof tooltipSettings !== 'string';
}
//# sourceMappingURL=get_tooltip_spec.js.map