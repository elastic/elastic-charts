"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendSizeSelector = void 0;
var default_theme_attributes_1 = require("../../common/default_theme_attributes");
var legend_item_1 = require("../../components/legend/legend_item");
var position_style_1 = require("../../components/legend/position_style");
var canvas_text_bbox_calculator_1 = require("../../utils/bbox/canvas_text_bbox_calculator");
var common_1 = require("../../utils/common");
var create_selector_1 = require("../create_selector");
var get_chart_theme_1 = require("./get_chart_theme");
var get_legend_config_selector_1 = require("./get_legend_config_selector");
var get_legend_items_labels_1 = require("./get_legend_items_labels");
var getParentDimensionSelector = function (state) { return state.parentDimensions; };
var SCROLL_BAR_WIDTH = 16;
var MARKER_WIDTH = 16;
var SHARED_MARGIN = 4;
var VERTICAL_PADDING = 4;
var TOP_MARGIN = 2;
exports.getLegendSizeSelector = (0, create_selector_1.createCustomCachedSelector)([get_legend_config_selector_1.getLegendConfigSelector, get_chart_theme_1.getChartThemeSelector, getParentDimensionSelector, get_legend_items_labels_1.getLegendItemsLabelsSelector], function (legendConfig, theme, parentDimensions, labels) {
    if (!legendConfig.showLegend) {
        return { width: 0, height: 0, margin: 0, position: position_style_1.LEGEND_TO_FULL_CONFIG[common_1.Position.Right] };
    }
    var bbox = (0, canvas_text_bbox_calculator_1.withTextMeasure)(function (textMeasure) {
        return labels.reduce(function (acc, _a) {
            var label = _a.label, depth = _a.depth;
            var _b = textMeasure(label, { fontFamily: default_theme_attributes_1.DEFAULT_FONT_FAMILY, fontVariant: 'normal', fontWeight: 400, fontStyle: 'normal' }, 12, 1.5), width = _b.width, height = _b.height;
            acc.width = Math.max(acc.width, width + depth * legend_item_1.LEGEND_HIERARCHY_MARGIN);
            acc.height = Math.max(acc.height, height);
            return acc;
        }, { width: 0, height: 0 });
    });
    var showLegendDisplayValue = legendConfig.showLegendExtra, legendPosition = legendConfig.legendPosition, legendAction = legendConfig.legendAction;
    var _a = theme.legend, verticalWidth = _a.verticalWidth, spacingBuffer = _a.spacingBuffer, margin = _a.margin;
    var actionDimension = (0, common_1.isDefined)(legendAction) ? 24 : 0;
    var legendItemWidth = MARKER_WIDTH + SHARED_MARGIN + bbox.width + (showLegendDisplayValue ? SHARED_MARGIN : 0);
    if (legendPosition.direction === common_1.LayoutDirection.Vertical) {
        var legendItemHeight = bbox.height + VERTICAL_PADDING * 2;
        var legendHeight = legendItemHeight * labels.length + TOP_MARGIN;
        var scrollBarDimension = legendHeight > parentDimensions.height ? SCROLL_BAR_WIDTH : 0;
        var staticWidth = spacingBuffer + actionDimension + scrollBarDimension;
        var width = Number.isFinite(legendConfig.legendSize)
            ? Math.min(Math.max(legendConfig.legendSize, legendItemWidth * 0.3 + staticWidth), parentDimensions.width * 0.7)
            : Math.floor(Math.min(legendItemWidth + staticWidth, verticalWidth));
        return {
            width: width,
            height: legendHeight,
            margin: margin,
            position: legendPosition,
        };
    }
    var isSingleLine = (parentDimensions.width - 20) / 200 > labels.length;
    var height = Number.isFinite(legendConfig.legendSize)
        ? Math.min(legendConfig.legendSize, parentDimensions.height * 0.7)
        : isSingleLine
            ? bbox.height + 16
            : bbox.height * 2 + 24;
    return {
        height: height,
        width: Math.floor(Math.min(legendItemWidth + spacingBuffer + actionDimension, verticalWidth)),
        margin: margin,
        position: legendPosition,
    };
});
//# sourceMappingURL=get_legend_size.js.map