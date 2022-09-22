"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBarPaddingsSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
exports.getBarPaddingsSelector = (0, create_selector_1.createCustomCachedSelector)([is_histogram_mode_enabled_1.isHistogramModeEnabledSelector, get_chart_theme_1.getChartThemeSelector], function (isHistogramMode, chartTheme) {
    return isHistogramMode ? chartTheme.scales.histogramPadding : chartTheme.scales.barsPadding;
});
//# sourceMappingURL=get_bar_paddings.js.map