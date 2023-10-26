"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPinnableTooltip = void 0;
const get_tooltip_spec_1 = require("./get_tooltip_spec");
const is_external_tooltip_visible_1 = require("./is_external_tooltip_visible");
const chart_types_1 = require("../../chart_types");
const get_tooltip_values_highlighted_geoms_1 = require("../../chart_types/xy_chart/state/selectors/get_tooltip_values_highlighted_geoms");
const create_selector_1 = require("../create_selector");
const pinnableTooltipCharts = new Set([
    chart_types_1.ChartType.XYAxis,
    chart_types_1.ChartType.Heatmap,
    chart_types_1.ChartType.Partition,
    chart_types_1.ChartType.Flame,
]);
const getChartType = ({ chartType }) => chartType;
exports.isPinnableTooltip = (0, create_selector_1.createCustomCachedSelector)([getChartType, is_external_tooltip_visible_1.isExternalTooltipVisibleSelector, get_tooltip_spec_1.getTooltipSpecSelector, get_tooltip_values_highlighted_geoms_1.getTooltipInfoAndGeomsSelector], (chartType, isExternal, { maxVisibleTooltipItems, maxTooltipItems, actions }, { tooltip, highlightedGeometries }) => {
    const isPinnableChartType = Boolean(chartType && pinnableTooltipCharts.has(chartType));
    const actionable = actions.length > 0 || !Array.isArray(actions);
    let hasHiddenSeries = false;
    if (chartType === chart_types_1.ChartType.XYAxis) {
        const infoCount = tooltip.values.length;
        const highlightCount = highlightedGeometries.length;
        hasHiddenSeries =
            (infoCount > highlightCount && infoCount > maxTooltipItems) || infoCount > maxVisibleTooltipItems;
    }
    return isPinnableChartType && !isExternal && (hasHiddenSeries || actionable);
});
//# sourceMappingURL=can_pin_tooltip.js.map