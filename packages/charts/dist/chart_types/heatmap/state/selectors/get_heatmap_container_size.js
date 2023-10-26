"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeatmapContainerSizeSelector = void 0;
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_legend_config_selector_1 = require("../../../../state/selectors/get_legend_config_selector");
const get_legend_size_1 = require("../../../../state/selectors/get_legend_size");
const common_1 = require("../../../../utils/common");
const getParentDimension = (state) => state.parentDimensions;
exports.getHeatmapContainerSizeSelector = (0, create_selector_1.createCustomCachedSelector)([getParentDimension, get_legend_size_1.getLegendSizeSelector, get_chart_theme_1.getChartThemeSelector, get_legend_config_selector_1.getLegendConfigSelector], (parentDimensions, legendSize, { heatmap: { maxLegendHeight } }, { showLegend, legendPosition }) => {
    if (!showLegend || legendPosition.floating) {
        return parentDimensions;
    }
    if (legendPosition.direction === common_1.LayoutDirection.Vertical) {
        return {
            left: 0,
            top: 0,
            width: parentDimensions.width - legendSize.width - legendSize.margin * 2,
            height: parentDimensions.height,
        };
    }
    const legendHeight = maxLegendHeight !== null && maxLegendHeight !== void 0 ? maxLegendHeight : legendSize.height + legendSize.margin * 2;
    return {
        left: 0,
        top: 0,
        width: parentDimensions.width,
        height: parentDimensions.height - legendHeight,
    };
});
//# sourceMappingURL=get_heatmap_container_size.js.map