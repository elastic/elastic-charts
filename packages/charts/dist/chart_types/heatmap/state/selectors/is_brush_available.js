"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrushEndProvided = exports.isBrushAvailableSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
exports.isBrushAvailableSelector = (0, create_selector_1.createCustomCachedSelector)([get_chart_theme_1.getChartThemeSelector, get_settings_spec_1.getSettingsSpecSelector], function (_a, _b) {
    var brushTool = _a.heatmap.brushTool;
    var onBrushEnd = _b.onBrushEnd;
    return Boolean(onBrushEnd) && brushTool.visible;
});
exports.isBrushEndProvided = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector], function (_a) {
    var onBrushEnd = _a.onBrushEnd;
    return Boolean(onBrushEnd);
});
//# sourceMappingURL=is_brush_available.js.map