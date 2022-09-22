"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedValuesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var tooltip_1 = require("../../tooltip/tooltip");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
exports.getHighlightedValuesSelector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_values_highlighted_geoms_1.getTooltipInfoSelector], function (_a) {
    var values = _a.values;
    return (0, tooltip_1.getHighlightedValues)(values);
});
//# sourceMappingURL=get_highlighted_values.js.map