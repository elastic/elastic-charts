"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBarValues = void 0;
const colors_1 = require("../../../../../common/colors");
const fill_text_color_1 = require("../../../../../common/fill_text_color");
const common_1 = require("../../../../../utils/common");
const specs_1 = require("../../../utils/specs");
const text_1 = require("../primitives/text");
const debug_1 = require("../utils/debug");
const panel_transform_1 = require("../utils/panel_transform");
const CHART_DIRECTION = {
    BottomUp: 0,
    TopToBottom: 180,
    LeftToRight: 90,
    RightToLeft: -90,
};
function renderBarValues(ctx, props) {
    const { bars, debug, rotation, renderingArea, barSeriesStyle, panel, background } = props;
    const { fontFamily, fontStyle, fill, alignment } = barSeriesStyle.displayValue;
    bars.forEach((bar) => {
        if (!bar.displayValue) {
            return;
        }
        const { text, fontSize, fontScale, overflowConstraints } = bar.displayValue;
        const shadowSize = getTextBorderSize(fill);
        const { fillColor, shadowColor } = getTextColors(fill, bar.color, background);
        const font = {
            fontFamily,
            fontStyle: fontStyle !== null && fontStyle !== void 0 ? fontStyle : 'normal',
            fontVariant: 'normal',
            fontWeight: 'normal',
            textColor: fillColor,
        };
        const { x, y, align, baseline, rect, overflow } = positionText(bar, bar.displayValue, rotation, barSeriesStyle.displayValue, alignment);
        if (overflowConstraints.has(specs_1.LabelOverflowConstraint.ChartEdges) && isOverflow(rect, renderingArea, rotation)) {
            return;
        }
        if (overflowConstraints.has(specs_1.LabelOverflowConstraint.BarGeometry) && overflow) {
            return;
        }
        const lines = [text];
        const { width, height } = bar.displayValue;
        if (debug)
            (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => (0, debug_1.renderDebugRect)(ctx, rect));
        lines.forEach((textLine, j) => {
            const origin = lineOrigin(x, y, rotation, j, lines.length, width, height);
            const fontAugment = { fontSize, align, baseline, shadow: shadowColor, shadowSize };
            (0, panel_transform_1.withPanelTransform)(ctx, panel, rotation, renderingArea, () => (0, text_1.renderText)(ctx, origin, textLine, { ...font, ...fontAugment }, -rotation, 0, 0, fontScale));
        });
    });
}
exports.renderBarValues = renderBarValues;
function lineOrigin(x, y, rotation, i, max, width, height) {
    const size = Math.abs(rotation) === 90 ? width : height;
    const sizeMultiplier = rotation > 0 ? -(i - max + 1) : rotation === 0 ? i : 0;
    return { x, y: y + size * sizeMultiplier };
}
function positionText(geom, valueBox, chartRotation, offsets, alignment) {
    const { offsetX, offsetY } = offsets;
    const horizontal = alignment === null || alignment === void 0 ? void 0 : alignment.horizontal;
    const vertical = alignment === null || alignment === void 0 ? void 0 : alignment.vertical;
    const horizontalOverflow = valueBox.width > geom.width || valueBox.height > geom.height;
    const verticalOverflow = valueBox.height > geom.width || valueBox.width > geom.height;
    switch (chartRotation) {
        case CHART_DIRECTION.TopToBottom: {
            const alignmentOffsetX = horizontal === common_1.HorizontalAlignment.Left
                ? geom.width / 2 - valueBox.width / 2
                : horizontal === common_1.HorizontalAlignment.Right
                    ? -geom.width / 2 + valueBox.width / 2
                    : 0;
            const alignmentOffsetY = vertical === common_1.VerticalAlignment.Top
                ? geom.height - valueBox.height
                : vertical === common_1.VerticalAlignment.Middle
                    ? geom.height / 2 - valueBox.height / 2
                    : 0;
            const x = geom.x + geom.width / 2 - offsetX + alignmentOffsetX;
            const y = geom.y + offsetY + alignmentOffsetY;
            const rect = { x: x - valueBox.width / 2, y, width: valueBox.width, height: valueBox.height };
            return { x, y, rect, align: 'center', baseline: 'bottom', overflow: horizontalOverflow };
        }
        case CHART_DIRECTION.RightToLeft: {
            const alignmentOffsetX = horizontal === common_1.HorizontalAlignment.Right
                ? geom.height - valueBox.width
                : horizontal === common_1.HorizontalAlignment.Center
                    ? geom.height / 2 - valueBox.width / 2
                    : 0;
            const alignmentOffsetY = vertical === common_1.VerticalAlignment.Bottom
                ? -geom.width + valueBox.height
                : vertical === common_1.VerticalAlignment.Middle
                    ? -geom.width / 2 + valueBox.height / 2
                    : 0;
            const x = geom.x + geom.width + offsetY + alignmentOffsetY;
            const y = geom.y - offsetX + alignmentOffsetX;
            const rect = { x: x - valueBox.height, y, width: valueBox.height, height: valueBox.width };
            return { x, y, rect, align: 'left', baseline: 'top', overflow: verticalOverflow };
        }
        case CHART_DIRECTION.LeftToRight: {
            const alignmentOffsetX = horizontal === common_1.HorizontalAlignment.Left
                ? geom.height - valueBox.width
                : horizontal === common_1.HorizontalAlignment.Center
                    ? geom.height / 2 - valueBox.width / 2
                    : 0;
            const alignmentOffsetY = vertical === common_1.VerticalAlignment.Bottom
                ? geom.width - valueBox.height
                : vertical === common_1.VerticalAlignment.Middle
                    ? geom.width / 2 - valueBox.height / 2
                    : 0;
            const x = geom.x - offsetY + alignmentOffsetY;
            const y = geom.y + offsetX + alignmentOffsetX;
            const rect = { x, y, width: valueBox.height, height: valueBox.width };
            return { x, y, rect, align: 'right', baseline: 'top', overflow: verticalOverflow };
        }
        case CHART_DIRECTION.BottomUp:
        default: {
            const alignmentOffsetX = horizontal === common_1.HorizontalAlignment.Left
                ? -geom.width / 2 + valueBox.width / 2
                : horizontal === common_1.HorizontalAlignment.Right
                    ? geom.width / 2 - valueBox.width / 2
                    : 0;
            const alignmentOffsetY = vertical === common_1.VerticalAlignment.Bottom
                ? geom.height - valueBox.height
                : vertical === common_1.VerticalAlignment.Middle
                    ? geom.height / 2 - valueBox.height / 2
                    : 0;
            const x = geom.x + geom.width / 2 - offsetX + alignmentOffsetX;
            const y = geom.y - offsetY + alignmentOffsetY;
            const rect = { x: x - valueBox.width / 2, y, width: valueBox.width, height: valueBox.height };
            return { x, y, rect, align: 'center', baseline: 'top', overflow: horizontalOverflow };
        }
    }
}
function isOverflow(rect, chartDimensions, chartRotation) {
    const vertical = Math.abs(chartRotation) === 90;
    const cWidth = vertical ? chartDimensions.height : chartDimensions.width;
    const cHeight = vertical ? chartDimensions.width : chartDimensions.height;
    return rect.x < 0 || rect.x + rect.width > cWidth || rect.y < 0 || rect.y + rect.height > cHeight;
}
function getTextColors(fillDefinition, geometryColor, { color: backgroundColor, fallbackColor: fallbackBGColor }) {
    if (typeof fillDefinition === 'string') {
        return { fillColor: fillDefinition, shadowColor: colors_1.Colors.Transparent.keyword };
    }
    if ('color' in fillDefinition) {
        return {
            fillColor: fillDefinition.color,
            shadowColor: fillDefinition.borderColor || colors_1.Colors.Transparent.keyword,
        };
    }
    const fillColor = (0, fill_text_color_1.fillTextColor)(fallbackBGColor, geometryColor, backgroundColor).color.keyword;
    const shadowColor = (0, fill_text_color_1.fillTextColor)(fallbackBGColor, fillColor, backgroundColor).color.keyword;
    return {
        fillColor,
        shadowColor,
    };
}
const DEFAULT_BORDER_WIDTH = 1.5;
const MAX_BORDER_WIDTH = 8;
function getTextBorderSize(fill) {
    var _a;
    if (typeof fill === 'string') {
        return DEFAULT_BORDER_WIDTH;
    }
    if ('borderWidth' in fill) {
        return Math.min((_a = fill.borderWidth) !== null && _a !== void 0 ? _a : DEFAULT_BORDER_WIDTH, MAX_BORDER_WIDTH);
    }
    const borderWidth = 'textBorder' in fill && typeof fill.textBorder === 'number' ? fill.textBorder : DEFAULT_BORDER_WIDTH;
    return Math.min(borderWidth, MAX_BORDER_WIDTH);
}
//# sourceMappingURL=bar.js.map