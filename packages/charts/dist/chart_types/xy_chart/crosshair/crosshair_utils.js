"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipAnchorPosition = exports.getCursorBandPosition = exports.getCursorLinePosition = exports.getSnapPosition = exports.DEFAULT_SNAP_POSITION_BAND = void 0;
var types_1 = require("../../../scales/types");
var constants_1 = require("../../../specs/constants");
var common_1 = require("../state/utils/common");
exports.DEFAULT_SNAP_POSITION_BAND = 1;
function getSnapPosition(value, scale, totalBarsInCluster) {
    if (totalBarsInCluster === void 0) { totalBarsInCluster = 1; }
    var position = scale.scale(value);
    if (Number.isNaN(position)) {
        return;
    }
    if (scale.bandwidth > 0) {
        var band = scale.bandwidth / (1 - scale.barsPadding);
        var halfPadding = (band - scale.bandwidth) / 2;
        return {
            position: position - halfPadding * totalBarsInCluster,
            band: band * totalBarsInCluster,
        };
    }
    return {
        position: position,
        band: exports.DEFAULT_SNAP_POSITION_BAND,
    };
}
exports.getSnapPosition = getSnapPosition;
function getCursorLinePosition(chartRotation, chartDimensions, projectedPointerPosition) {
    var x = projectedPointerPosition.x, y = projectedPointerPosition.y;
    if (x < 0 || y < 0) {
        return undefined;
    }
    var left = chartDimensions.left, top = chartDimensions.top, width = chartDimensions.width, height = chartDimensions.height;
    var isHorizontalRotated = (0, common_1.isHorizontalRotation)(chartRotation);
    if (isHorizontalRotated) {
        var crosshairTop = y + top;
        return {
            x1: left,
            x2: left + width,
            y1: crosshairTop,
            y2: crosshairTop,
        };
    }
    var crosshairLeft = x + left;
    return {
        x1: crosshairLeft,
        x2: crosshairLeft,
        y1: top,
        y2: top + height,
    };
}
exports.getCursorLinePosition = getCursorLinePosition;
function getCursorBandPosition(chartRotation, panel, cursorPosition, invertedValue, snapEnabled, xScale, totalBarsInCluster) {
    var top = panel.top, left = panel.left, width = panel.width, height = panel.height;
    var x = cursorPosition.x, y = cursorPosition.y;
    var isHorizontalRotated = (0, common_1.isHorizontalRotation)(chartRotation);
    var chartWidth = isHorizontalRotated ? width : height;
    var chartHeight = isHorizontalRotated ? height : width;
    var isLineOrAreaOnly = !totalBarsInCluster;
    if (x > chartWidth || y > chartHeight || x < 0 || y < 0 || !invertedValue.withinBandwidth) {
        return undefined;
    }
    var snappedPosition = getSnapPosition(invertedValue.value, xScale, isLineOrAreaOnly ? 1 : totalBarsInCluster);
    if (!snappedPosition) {
        return undefined;
    }
    var position = snappedPosition.position, band = snappedPosition.band;
    var bandOffset = xScale.bandwidth > 0 ? band : 0;
    if (isHorizontalRotated) {
        var adjustedLeft = snapEnabled ? position : cursorPosition.x;
        var leftPosition = chartRotation === 0 ? left + adjustedLeft : left + width - adjustedLeft - bandOffset;
        var adjustedWidth = band;
        if (band > 1 && leftPosition + band > left + width) {
            adjustedWidth = left + width - leftPosition;
        }
        else if (band > 1 && leftPosition < left) {
            adjustedWidth = band - (left - leftPosition);
            leftPosition = left;
        }
        if (isLineOrAreaOnly && (0, types_1.isContinuousScale)(xScale)) {
            return {
                x: leftPosition,
                width: 0,
                y: top,
                height: height,
            };
        }
        return {
            x: leftPosition,
            y: top,
            width: adjustedWidth,
            height: height,
        };
    }
    var adjustedTop = snapEnabled ? position : cursorPosition.x;
    var topPosition = chartRotation === 90 ? top + adjustedTop : height + top - adjustedTop - bandOffset;
    var adjustedHeight = band;
    if (band > 1 && topPosition + band > top + height) {
        adjustedHeight = band - (topPosition + band - (top + height));
    }
    else if (band > 1 && topPosition < top) {
        adjustedHeight = band - (top - topPosition);
        topPosition = top;
    }
    if (isLineOrAreaOnly && (0, types_1.isContinuousScale)(xScale)) {
        return {
            x: left,
            width: width,
            y: topPosition,
            height: 0,
        };
    }
    return {
        y: topPosition,
        x: left,
        width: width,
        height: adjustedHeight,
    };
}
exports.getCursorBandPosition = getCursorBandPosition;
function getTooltipAnchorPosition(chartRotation, cursorBandPosition, cursorPosition, panel, stickTo) {
    if (stickTo === void 0) { stickTo = constants_1.TooltipStickTo.MousePosition; }
    var x = cursorBandPosition.x, y = cursorBandPosition.y, width = cursorBandPosition.width, height = cursorBandPosition.height;
    var isRotated = (0, common_1.isVerticalRotation)(chartRotation);
    if (!isRotated) {
        var stickY = stickTo === constants_1.TooltipStickTo.MousePosition
            ? cursorPosition.y + panel.top
            : stickTo === constants_1.TooltipStickTo.Middle
                ? y + height / 2
                : stickTo === constants_1.TooltipStickTo.Bottom
                    ? y + height
                    : y;
        return {
            x: x,
            width: width,
            y: stickY,
            height: 0,
        };
    }
    var stickX = stickTo === constants_1.TooltipStickTo.MousePosition
        ? cursorPosition.x + panel.left
        : stickTo === constants_1.TooltipStickTo.Right
            ? x + width
            : stickTo === constants_1.TooltipStickTo.Center
                ? x + width / 2
                : x;
    return {
        x: stickX,
        width: 0,
        y: y,
        height: height,
    };
}
exports.getTooltipAnchorPosition = getTooltipAnchorPosition;
//# sourceMappingURL=crosshair_utils.js.map