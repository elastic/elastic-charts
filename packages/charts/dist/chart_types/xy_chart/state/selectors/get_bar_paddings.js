"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBarPaddingsSelector = void 0;
const is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
exports.getBarPaddingsSelector = (0, create_selector_1.createCustomCachedSelector)([is_histogram_mode_enabled_1.isHistogramModeEnabledSelector, get_chart_theme_1.getChartThemeSelector], (isHistogramMode, chartTheme) => isHistogramMode ? chartTheme.scales.histogramPadding : chartTheme.scales.barsPadding);
//# sourceMappingURL=get_bar_paddings.js.map