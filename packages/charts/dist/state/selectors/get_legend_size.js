"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendSizeSelector = void 0;
const get_chart_theme_1 = require("./get_chart_theme");
const get_legend_config_selector_1 = require("./get_legend_config_selector");
const get_legend_items_labels_1 = require("./get_legend_items_labels");
const default_theme_attributes_1 = require("../../common/default_theme_attributes");
const legend_item_1 = require("../../components/legend/legend_item");
const position_style_1 = require("../../components/legend/position_style");
const canvas_text_bbox_calculator_1 = require("../../utils/bbox/canvas_text_bbox_calculator");
const common_1 = require("../../utils/common");
const create_selector_1 = require("../create_selector");
const getParentDimensionSelector = (state) => state.parentDimensions;
const SCROLL_BAR_WIDTH = 16;
const MARKER_WIDTH = 16;
const SHARED_MARGIN = 4;
const VERTICAL_PADDING = 4;
const TOP_MARGIN = 2;
exports.getLegendSizeSelector = (0, create_selector_1.createCustomCachedSelector)([get_legend_config_selector_1.getLegendConfigSelector, get_chart_theme_1.getChartThemeSelector, getParentDimensionSelector, get_legend_items_labels_1.getLegendItemsLabelsSelector], (legendConfig, theme, parentDimensions, labels) => {
    if (!legendConfig.showLegend) {
        return { width: 0, height: 0, margin: 0, position: position_style_1.LEGEND_TO_FULL_CONFIG[common_1.Position.Right] };
    }
    const bbox = (0, canvas_text_bbox_calculator_1.withTextMeasure)((textMeasure) => labels.reduce((acc, { label, depth }) => {
        const { width, height } = textMeasure(label, { fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY, fontVariant: 'normal', fontWeight: 400, fontStyle: 'normal' }, 12, 1.5);
        acc.width = Math.max(acc.width, width + depth * legend_item_1.LEGEND_HIERARCHY_MARGIN);
        acc.height = Math.max(acc.height, height);
        return acc;
    }, { width: 0, height: 0 }));
    const { showLegendExtra: showLegendDisplayValue, legendPosition, legendAction } = legendConfig;
    const { legend: { verticalWidth, spacingBuffer, margin }, } = theme;
    const actionDimension = (0, common_1.isDefined)(legendAction) ? 24 : 0;
    const legendItemWidth = MARKER_WIDTH + SHARED_MARGIN + bbox.width + (showLegendDisplayValue ? SHARED_MARGIN : 0);
    if (legendPosition.direction === common_1.LayoutDirection.Vertical) {
        const legendItemHeight = bbox.height + VERTICAL_PADDING * 2;
        const legendHeight = legendItemHeight * labels.length + TOP_MARGIN;
        const scrollBarDimension = legendHeight > parentDimensions.height ? SCROLL_BAR_WIDTH : 0;
        const staticWidth = spacingBuffer + actionDimension + scrollBarDimension;
        const width = Number.isFinite(legendConfig.legendSize)
            ? Math.min(Math.max(legendConfig.legendSize, legendItemWidth * 0.3 + staticWidth), parentDimensions.width * 0.7)
            : Math.floor(Math.min(legendItemWidth + staticWidth, verticalWidth));
        return {
            width,
            height: legendHeight,
            margin,
            position: legendPosition,
        };
    }
    const isSingleLine = (parentDimensions.width - 20) / 200 > labels.length;
    const height = Number.isFinite(legendConfig.legendSize)
        ? Math.min(legendConfig.legendSize, parentDimensions.height * 0.7)
        : isSingleLine
            ? bbox.height + 16
            : bbox.height * 2 + 24;
    return {
        height,
        width: Math.floor(Math.min(legendItemWidth + spacingBuffer + actionDimension, verticalWidth)),
        margin,
        position: legendPosition,
    };
});
//# sourceMappingURL=get_legend_size.js.map