"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipAnchorPosition = exports.getCursorBandPosition = exports.getCursorLinePosition = exports.getSnapPosition = exports.DEFAULT_SNAP_POSITION_BAND = void 0;
const types_1 = require("../../../scales/types");
const constants_1 = require("../../../specs/constants");
const common_1 = require("../state/utils/common");
exports.DEFAULT_SNAP_POSITION_BAND = 1;
function getSnapPosition(value, scale, totalBarsInCluster = 1) {
    const position = scale.scale(value);
    if (Number.isNaN(position)) {
        return;
    }
    if (scale.bandwidth > 0) {
        const band = scale.bandwidth / (1 - scale.barsPadding);
        const halfPadding = (band - scale.bandwidth) / 2;
        return {
            position: position - halfPadding * totalBarsInCluster,
            band: band * totalBarsInCluster,
        };
    }
    return {
        position,
        band: exports.DEFAULT_SNAP_POSITION_BAND,
    };
}
exports.getSnapPosition = getSnapPosition;
function getCursorLinePosition(chartRotation, chartDimensions, projectedPointerPosition) {
    const { x, y } = projectedPointerPosition;
    if (x < 0 || y < 0) {
        return undefined;
    }
    const { left, top, width, height } = chartDimensions;
    const isHorizontalRotated = (0, common_1.isHorizontalRotation)(chartRotation);
    if (isHorizontalRotated) {
        const crosshairTop = y + top;
        return {
            x1: left,
            x2: left + width,
            y1: crosshairTop,
            y2: crosshairTop,
        };
    }
    const crosshairLeft = x + left;
    return {
        x1: crosshairLeft,
        x2: crosshairLeft,
        y1: top,
        y2: top + height,
    };
}
exports.getCursorLinePosition = getCursorLinePosition;
function getCursorBandPosition(chartRotation, panel, cursorPosition, invertedValue, snapEnabled, xScale, totalBarsInCluster) {
    const { top, left, width, height } = panel;
    const { x, y } = cursorPosition;
    const isHorizontalRotated = (0, common_1.isHorizontalRotation)(chartRotation);
    const chartWidth = isHorizontalRotated ? width : height;
    const chartHeight = isHorizontalRotated ? height : width;
    const isLineOrAreaOnly = !totalBarsInCluster;
    if (x > chartWidth || y > chartHeight || x < 0 || y < 0 || !invertedValue.withinBandwidth) {
        return undefined;
    }
    const snappedPosition = getSnapPosition(invertedValue.value, xScale, isLineOrAreaOnly ? 1 : totalBarsInCluster);
    if (!snappedPosition) {
        return undefined;
    }
    const { position, band } = snappedPosition;
    const bandOffset = xScale.bandwidth > 0 ? band : 0;
    if (isHorizontalRotated) {
        const adjustedLeft = snapEnabled ? position : cursorPosition.x;
        let leftPosition = chartRotation === 0 ? left + adjustedLeft : left + width - adjustedLeft - bandOffset;
        let adjustedWidth = band;
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
                height,
            };
        }
        return {
            x: leftPosition,
            y: top,
            width: adjustedWidth,
            height,
        };
    }
    const adjustedTop = snapEnabled ? position : cursorPosition.x;
    let topPosition = chartRotation === 90 ? top + adjustedTop : height + top - adjustedTop - bandOffset;
    let adjustedHeight = band;
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
            width,
            y: topPosition,
            height: 0,
        };
    }
    return {
        y: topPosition,
        x: left,
        width,
        height: adjustedHeight,
    };
}
exports.getCursorBandPosition = getCursorBandPosition;
function getTooltipAnchorPosition(chartRotation, cursorBandPosition, cursorPosition, panel, stickTo = constants_1.TooltipStickTo.MousePosition) {
    const { x, y, width, height } = cursorBandPosition;
    const isRotated = (0, common_1.isVerticalRotation)(chartRotation);
    if (!isRotated) {
        const stickY = stickTo === constants_1.TooltipStickTo.MousePosition
            ? cursorPosition.y + panel.top
            : stickTo === constants_1.TooltipStickTo.Middle
                ? y + height / 2
                : stickTo === constants_1.TooltipStickTo.Bottom
                    ? y + height
                    : y;
        return {
            x,
            width,
            y: stickY,
            height: 0,
        };
    }
    const stickX = stickTo === constants_1.TooltipStickTo.MousePosition
        ? cursorPosition.x + panel.left
        : stickTo === constants_1.TooltipStickTo.Right
            ? x + width
            : stickTo === constants_1.TooltipStickTo.Center
                ? x + width / 2
                : x;
    return {
        x: stickX,
        width: 0,
        y,
        height,
    };
}
exports.getTooltipAnchorPosition = getTooltipAnchorPosition;
//# sourceMappingURL=crosshair_utils.js.map