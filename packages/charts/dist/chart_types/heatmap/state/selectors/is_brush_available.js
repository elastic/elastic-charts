"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrushEndProvided = exports.isBrushAvailableSelector = void 0;
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
exports.isBrushAvailableSelector = (0, create_selector_1.createCustomCachedSelector)([get_chart_theme_1.getChartThemeSelector, get_settings_spec_1.getSettingsSpecSelector], ({ heatmap: { brushTool } }, { onBrushEnd }) => Boolean(onBrushEnd) && brushTool.visible);
exports.isBrushEndProvided = (0, create_selector_1.createCustomCachedSelector)([get_settings_spec_1.getSettingsSpecSelector], ({ onBrushEnd }) => Boolean(onBrushEnd));
//# sourceMappingURL=is_brush_available.js.map