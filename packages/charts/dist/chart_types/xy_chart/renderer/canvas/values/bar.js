"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBarValues = void 0;
var colors_1 = require("../../../../../common/colors");
var fill_text_color_1 = require("../../../../../common/fill_text_color");
var common_1 = require("../../../../../utils/common");
var specs_1 = require("../../../utils/specs");
var text_1 = require("../primitives/text");
var debug_1 = require("../utils/debug");
var panel_transform_1 = require("../utils/panel_transform");
var CHART_DIRECTION = {
    BottomUp: 0,
    TopToBottom: 180,
    LeftToRight: 90,
    RightToLeft: -90,
};
function renderBarValues(ctx, props) {
    var bars = props.bars, debug = props.debug, rotation = props.rotation, renderingArea = props.renderingArea, barSeriesStyle = props.barSeriesStyle, panel = props.panel, background = props.background;
    var _a = barSeriesStyle.displayValue, fontFamily = _a.fontFamily, fontStyle = _a.fontStyle, fill = _a.fill, alignment = _a.alignment;
    bars.forEach(function (bar) {
        if (!bar.displayValue) {
            return;
        }
        var _a = bar.displayValue, text = _a.text, fontSize = _a.fontSize, fontScale = _a.fontScale, overflowConstraints = _a.overflowConstraints, isValueContainedInElement = _a.isValueContainedInElement;
        var shadowSize = getTextBorderSize(fill);
        var _b = getTextColors(fill, bar.color, background), fillColor = _b.fillColor, shadowColor = _b.shadowColor;
        var font = {
            fontFamily: fontFamily,
            fontStyle: fontStyle !== null && fontStyle !== void 0 ? fontStyle : 'normal',
            fontVariant: 'normal',
            fontWeight: 'normal',
            textColor: fillColor,
        };
        var _c = positionText(bar, bar.displayValue, rotation, barSeriesStyle.displayValue, alignment), x = _c.x, y = _c.y, align = _c.align, baseline = _c.baseline, rect = _c.rect, overflow = _c.overflow;
        if (overflowConstraints.has(specs_1.LabelOverflowConstraint.ChartEdges) && isOverflow(rect, renderingArea, rotation)) {
            return;
        }
        if (overflowConstraints.has(specs_1.LabelOverflowConstraint.BarGeometry) && overflow) {
            return;
        }
        var _d = isValueContainedInElement
            ? (0, text_1.wrapLines)(ctx, text, font, fontSize, rotation === 0 || rotation === 180 ? bar.width : bar.height, 100)
            : { lines: [text], width: bar.displayValue.width, height: bar.displayValue.height }, width = _d.width, height = _d.height, lines = _d.lines;
        if (debug)
            (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () { return (0, debug_1.renderDebugRect)(ctx, rect); });
        lines.forEach(function (textLine, j) {
            var origin = lineOrigin(x, y, rotation, j, lines.length, width, height);
            var fontAugment = { fontSize: fontSize, align: align, baseline: baseline, shadow: shadowColor, shadowSize: shadowSize };
            (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, function () {
                return (0, text_1.renderText)(ctx, origin, textLine, __assign(__assign({}, font), fontAugment), -rotation, 0, 0, fontScale);
            });
        });
    });
}
exports.renderBarValues = renderBarValues;
function lineOrigin(x, y, rotation, i, max, width, height) {
    var size = Math.abs(rotation) === 90 ? width : height;
    var sizeMultiplier = rotation > 0 ? -(i - max + 1) : rotation === 0 ? i : 0;
    return { x: x, y: y + size * sizeMultiplier };
}
function positionText(geom, valueBox, chartRotation, offsets, alignment) {
    var offsetX = offsets.offsetX, offsetY = offsets.offsetY;
    var horizontal = alignment === null || alignment === void 0 ? void 0 : alignment.horizontal;
    var vertical = alignment === null || alignment === void 0 ? void 0 : alignment.vertical;
    var horizontalOverflow = valueBox.width > geom.width || valueBox.height > geom.height;
    var verticalOverflow = valueBox.height > geom.width || valueBox.width > geom.height;
    switch (chartRotation) {
        case CHART_DIRECTION.TopToBottom: {
            var alignmentOffsetX = horizontal === common_1.HorizontalAlignment.Left
                ? geom.width / 2 - valueBox.width / 2
                : horizontal === common_1.HorizontalAlignment.Right
                    ? -geom.width / 2 + valueBox.width / 2
                    : 0;
            var alignmentOffsetY = vertical === common_1.VerticalAlignment.Top
                ? geom.height - valueBox.height
                : vertical === common_1.VerticalAlignment.Middle
                    ? geom.height / 2 - valueBox.height / 2
                    : 0;
            var x = geom.x + geom.width / 2 - offsetX + alignmentOffsetX;
            var y = geom.y + offsetY + alignmentOffsetY;
            var rect = { x: x - valueBox.width / 2, y: y, width: valueBox.width, height: valueBox.height };
            return { x: x, y: y, rect: rect, align: 'center', baseline: 'bottom', overflow: horizontalOverflow };
        }
        case CHART_DIRECTION.RightToLeft: {
            var alignmentOffsetX = horizontal === common_1.HorizontalAlignment.Right
                ? geom.height - valueBox.width
                : horizontal === common_1.HorizontalAlignment.Center
                    ? geom.height / 2 - valueBox.width / 2
                    : 0;
            var alignmentOffsetY = vertical === common_1.VerticalAlignment.Bottom
                ? -geom.width + valueBox.height
                : vertical === common_1.VerticalAlignment.Middle
                    ? -geom.width / 2 + valueBox.height / 2
                    : 0;
            var x = geom.x + geom.width + offsetY + alignmentOffsetY;
            var y = geom.y - offsetX + alignmentOffsetX;
            var rect = { x: x - valueBox.height, y: y, width: valueBox.height, height: valueBox.width };
            return { x: x, y: y, rect: rect, align: 'left', baseline: 'top', overflow: verticalOverflow };
        }
        case CHART_DIRECTION.LeftToRight: {
            var alignmentOffsetX = horizontal === common_1.HorizontalAlignment.Left
                ? geom.height - valueBox.width
                : horizontal === common_1.HorizontalAlignment.Center
                    ? geom.height / 2 - valueBox.width / 2
                    : 0;
            var alignmentOffsetY = vertical === common_1.VerticalAlignment.Bottom
                ? geom.width - valueBox.height
                : vertical === common_1.VerticalAlignment.Middle
                    ? geom.width / 2 - valueBox.height / 2
                    : 0;
            var x = geom.x - offsetY + alignmentOffsetY;
            var y = geom.y + offsetX + alignmentOffsetX;
            var rect = { x: x, y: y, width: valueBox.height, height: valueBox.width };
            return { x: x, y: y, rect: rect, align: 'right', baseline: 'top', overflow: verticalOverflow };
        }
        case CHART_DIRECTION.BottomUp:
        default: {
            var alignmentOffsetX = horizontal === common_1.HorizontalAlignment.Left
                ? -geom.width / 2 + valueBox.width / 2
                : horizontal === common_1.HorizontalAlignment.Right
                    ? geom.width / 2 - valueBox.width / 2
                    : 0;
            var alignmentOffsetY = vertical === common_1.VerticalAlignment.Bottom
                ? geom.height - valueBox.height
                : vertical === common_1.VerticalAlignment.Middle
                    ? geom.height / 2 - valueBox.height / 2
                    : 0;
            var x = geom.x + geom.width / 2 - offsetX + alignmentOffsetX;
            var y = geom.y - offsetY + alignmentOffsetY;
            var rect = { x: x - valueBox.width / 2, y: y, width: valueBox.width, height: valueBox.height };
            return { x: x, y: y, rect: rect, align: 'center', baseline: 'top', overflow: horizontalOverflow };
        }
    }
}
function isOverflow(rect, chartDimensions, chartRotation) {
    var vertical = Math.abs(chartRotation) === 90;
    var cWidth = vertical ? chartDimensions.height : chartDimensions.width;
    var cHeight = vertical ? chartDimensions.width : chartDimensions.height;
    return rect.x < 0 || rect.x + rect.width > cWidth || rect.y < 0 || rect.y + rect.height > cHeight;
}
function getTextColors(fillDefinition, geometryColor, _a) {
    var backgroundColor = _a.color, fallbackBGColor = _a.fallbackColor;
    if (typeof fillDefinition === 'string') {
        return { fillColor: fillDefinition, shadowColor: colors_1.Colors.Transparent.keyword };
    }
    if ('color' in fillDefinition) {
        return {
            fillColor: fillDefinition.color,
            shadowColor: fillDefinition.borderColor || colors_1.Colors.Transparent.keyword,
        };
    }
    var fillColor = (0, fill_text_color_1.fillTextColor)(fallbackBGColor, geometryColor, backgroundColor);
    var shadowColor = (0, fill_text_color_1.fillTextColor)(fallbackBGColor, fillColor, backgroundColor);
    return {
        fillColor: fillColor,
        shadowColor: shadowColor,
    };
}
var DEFAULT_BORDER_WIDTH = 1.5;
var MAX_BORDER_WIDTH = 8;
function getTextBorderSize(fill) {
    var _a;
    if (typeof fill === 'string') {
        return DEFAULT_BORDER_WIDTH;
    }
    if ('borderWidth' in fill) {
        return Math.min((_a = fill.borderWidth) !== null && _a !== void 0 ? _a : DEFAULT_BORDER_WIDTH, MAX_BORDER_WIDTH);
    }
    var borderWidth = 'textBorder' in fill && typeof fill.textBorder === 'number' ? fill.textBorder : DEFAULT_BORDER_WIDTH;
    return Math.min(borderWidth, MAX_BORDER_WIDTH);
}
//# sourceMappingURL=bar.js.map