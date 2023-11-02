"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxesGeometries = exports.shouldShowTicks = exports.getPosition = exports.getAllAxisLayersGirth = exports.getTitleDimension = exports.getTickLabelPosition = exports.computeRotatedLabelDimensions = exports.getScaleForAxisSpec = exports.isXDomain = exports.defaultTickFormatter = void 0;
const axis_type_utils_1 = require("./axis_type_utils");
const scales_1 = require("./scales");
const panel_utils_1 = require("../../../common/panel_utils");
const common_1 = require("../../../utils/common");
const dimensions_1 = require("../../../utils/dimensions");
const defaultTickFormatter = (tick) => `${tick}`;
exports.defaultTickFormatter = defaultTickFormatter;
function isXDomain(position, chartRotation) {
    return (0, axis_type_utils_1.isHorizontalAxis)(position) === (chartRotation % 180 === 0);
}
exports.isXDomain = isXDomain;
function getScaleForAxisSpec({ xDomain, yDomains }, { rotation: chartRotation }, totalBarsInCluster, barsPadding, enableHistogramMode) {
    return ({ groupId, integersOnly, position }, range) => {
        var _a;
        return isXDomain(position, chartRotation)
            ? (0, scales_1.computeXScale)({ xDomain, totalBarsInCluster, range, barsPadding, enableHistogramMode, integersOnly })
            : (_a = (0, scales_1.computeYScales)({ yDomains, range, integersOnly }).get(groupId)) !== null && _a !== void 0 ? _a : null;
    };
}
exports.getScaleForAxisSpec = getScaleForAxisSpec;
function computeRotatedLabelDimensions(unrotatedDims, degreesRotation) {
    const { width, height } = unrotatedDims;
    const radians = (0, common_1.degToRad)(degreesRotation);
    const rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
    const rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
    return { width: rotatedWidth, height: rotatedHeight };
}
exports.computeRotatedLabelDimensions = computeRotatedLabelDimensions;
function getUserTextOffsets(dimensions, { x, y, reference }) {
    return reference === 'global'
        ? {
            local: { x: 0, y: 0 },
            global: {
                x: (0, common_1.getPercentageValue)(x, dimensions.maxLabelBboxWidth, 0),
                y: (0, common_1.getPercentageValue)(y, dimensions.maxLabelBboxHeight, 0),
            },
        }
        : {
            local: {
                x: (0, common_1.getPercentageValue)(x, dimensions.maxLabelTextWidth, 0),
                y: (0, common_1.getPercentageValue)(y, dimensions.maxLabelTextHeight, 0),
            },
            global: { x: 0, y: 0 },
        };
}
const horizontalOffsetMultiplier = {
    [common_1.HorizontalAlignment.Left]: -1,
    [common_1.HorizontalAlignment.Right]: 1,
    [common_1.HorizontalAlignment.Center]: 0,
};
const verticalOffsetMultiplier = {
    [common_1.VerticalAlignment.Top]: -1,
    [common_1.VerticalAlignment.Bottom]: 1,
    [common_1.VerticalAlignment.Middle]: 0,
};
function getHorizontalAlign(position, rotation, alignment) {
    if (alignment === common_1.HorizontalAlignment.Center ||
        alignment === common_1.HorizontalAlignment.Right ||
        alignment === common_1.HorizontalAlignment.Left) {
        return alignment;
    }
    if (Math.abs(rotation) === 90) {
        if (position === common_1.Position.Top) {
            return rotation === 90 ? common_1.HorizontalAlignment.Right : common_1.HorizontalAlignment.Left;
        }
        else if (position === common_1.Position.Bottom) {
            return rotation === -90 ? common_1.HorizontalAlignment.Right : common_1.HorizontalAlignment.Left;
        }
    }
    else {
        if (position === common_1.Position.Left) {
            return alignment === common_1.HorizontalAlignment.Near ? common_1.HorizontalAlignment.Right : common_1.HorizontalAlignment.Left;
        }
        else if (position === common_1.Position.Right) {
            return alignment === common_1.HorizontalAlignment.Near ? common_1.HorizontalAlignment.Left : common_1.HorizontalAlignment.Right;
        }
    }
    return common_1.HorizontalAlignment.Center;
}
function getVerticalAlign(position, rotation, alignment) {
    if (alignment === common_1.VerticalAlignment.Middle ||
        alignment === common_1.VerticalAlignment.Top ||
        alignment === common_1.VerticalAlignment.Bottom) {
        return alignment;
    }
    if (rotation % 180 === 0) {
        if (position === common_1.Position.Left) {
            return rotation === 0 ? common_1.VerticalAlignment.Bottom : common_1.VerticalAlignment.Top;
        }
        else if (position === common_1.Position.Right) {
            return rotation === 180 ? common_1.VerticalAlignment.Bottom : common_1.VerticalAlignment.Top;
        }
    }
    else {
        if (position === common_1.Position.Top) {
            return alignment === common_1.VerticalAlignment.Near ? common_1.VerticalAlignment.Bottom : common_1.VerticalAlignment.Top;
        }
        else if (position === common_1.Position.Bottom) {
            return alignment === common_1.VerticalAlignment.Near ? common_1.VerticalAlignment.Top : common_1.VerticalAlignment.Bottom;
        }
    }
    return common_1.VerticalAlignment.Middle;
}
function getTickLabelPosition({ tickLine, tickLabel }, tickPosition, pos, rotation, axisSize, tickDimensions, showTicks, textOffset, textAlignment) {
    const { maxLabelBboxWidth, maxLabelTextWidth, maxLabelBboxHeight, maxLabelTextHeight } = tickDimensions;
    const tickDimension = showTicks ? tickLine.size + tickLine.padding : 0;
    const labelInnerPadding = (0, dimensions_1.innerPad)(tickLabel.padding);
    const horizontalAlign = getHorizontalAlign(pos, rotation, textAlignment.horizontal);
    const verticalAlign = getVerticalAlign(pos, rotation, textAlignment.vertical);
    const userOffsets = getUserTextOffsets(tickDimensions, textOffset);
    const paddedTickDimension = tickDimension + labelInnerPadding;
    const axisNetSize = ((0, axis_type_utils_1.isVerticalAxis)(pos) ? axisSize.width : axisSize.height) - paddedTickDimension;
    const labelBoxHalfGirth = (0, axis_type_utils_1.isHorizontalAxis)(pos) ? maxLabelBboxHeight / 2 : maxLabelBboxWidth / 2;
    const labelHalfWidth = maxLabelTextWidth / 2;
    return {
        horizontalAlign,
        verticalAlign,
        x: pos === common_1.Position.Left ? axisNetSize : pos === common_1.Position.Right ? paddedTickDimension : tickPosition,
        y: pos === common_1.Position.Top ? axisNetSize : pos === common_1.Position.Bottom ? paddedTickDimension : tickPosition,
        offsetX: userOffsets.global.x + ((0, axis_type_utils_1.isHorizontalAxis)(pos) ? 0 : horizontalOffsetMultiplier[pos] * labelBoxHalfGirth),
        offsetY: userOffsets.global.y + ((0, axis_type_utils_1.isVerticalAxis)(pos) ? 0 : verticalOffsetMultiplier[pos] * labelBoxHalfGirth),
        textOffsetX: userOffsets.local.x +
            ((0, axis_type_utils_1.isHorizontalAxis)(pos) && rotation === 0 ? 0 : labelHalfWidth * horizontalOffsetMultiplier[horizontalAlign]),
        textOffsetY: userOffsets.local.y + (maxLabelTextHeight / 2) * verticalOffsetMultiplier[verticalAlign],
    };
}
exports.getTickLabelPosition = getTickLabelPosition;
function getTitleDimension({ visible, fontSize, padding, }) {
    return visible && fontSize > 0 ? (0, dimensions_1.innerPad)(padding) + fontSize + (0, dimensions_1.outerPad)(padding) : 0;
}
exports.getTitleDimension = getTitleDimension;
const getAllAxisLayersGirth = (timeAxisLayerCount, maxLabelBoxGirth, axisHorizontal) => {
    const axisLayerCount = timeAxisLayerCount > 0 && axisHorizontal ? timeAxisLayerCount : 1;
    return axisLayerCount * maxLabelBoxGirth;
};
exports.getAllAxisLayersGirth = getAllAxisLayersGirth;
function getPosition({ chartDimensions }, chartMargins, { axisTitle, axisPanelTitle, tickLine, tickLabel }, { title, position, hide, timeAxisLayerCount }, { maxLabelBboxHeight, maxLabelBboxWidth }, smScales, { top: cumTopSum, bottom: cumBottomSum, left: cumLeftSum, right: cumRightSum }) {
    const tickDimension = shouldShowTicks(tickLine, hide) ? tickLine.size + tickLine.padding : 0;
    const labelPaddingSum = tickLabel.visible ? (0, dimensions_1.innerPad)(tickLabel.padding) + (0, dimensions_1.outerPad)(tickLabel.padding) : 0;
    const titleDimension = title ? getTitleDimension(axisTitle) : 0;
    const vertical = (0, axis_type_utils_1.isVerticalAxis)(position);
    const scaleBand = vertical ? smScales.vertical : smScales.horizontal;
    const panelTitleDimension = (0, panel_utils_1.hasSMDomain)(scaleBand) ? getTitleDimension(axisPanelTitle) : 0;
    const maxLabelBboxGirth = tickLabel.visible ? (vertical ? maxLabelBboxWidth : maxLabelBboxHeight) : 0;
    const shownLabelSize = (0, exports.getAllAxisLayersGirth)(timeAxisLayerCount, maxLabelBboxGirth, !vertical);
    const parallelSize = labelPaddingSum + shownLabelSize + tickDimension + titleDimension + panelTitleDimension;
    return {
        leftIncrement: position === common_1.Position.Left ? parallelSize + chartMargins.left : 0,
        rightIncrement: position === common_1.Position.Right ? parallelSize + chartMargins.right : 0,
        topIncrement: position === common_1.Position.Top ? parallelSize + chartMargins.top : 0,
        bottomIncrement: position === common_1.Position.Bottom ? parallelSize + chartMargins.bottom : 0,
        dimensions: {
            left: position === common_1.Position.Left
                ? chartMargins.left + cumLeftSum
                : chartDimensions.left + (position === common_1.Position.Right ? chartDimensions.width + cumRightSum : 0),
            top: position === common_1.Position.Top
                ? chartMargins.top + cumTopSum
                : chartDimensions.top + (position === common_1.Position.Bottom ? chartDimensions.height + cumBottomSum : 0),
            width: vertical ? parallelSize : chartDimensions.width,
            height: vertical ? chartDimensions.height : parallelSize,
        },
    };
}
exports.getPosition = getPosition;
function shouldShowTicks({ visible }, axisHidden) {
    return !axisHidden && visible;
}
exports.shouldShowTicks = shouldShowTicks;
function getAxesGeometries(chartDims, { chartPaddings, chartMargins, axes: sharedAxesStyle }, axisSpecs, axesStyles, smScales, visibleTicksSet) {
    const panel = (0, panel_utils_1.getPanelSize)(smScales);
    return [...visibleTicksSet].reduce((acc, [axisId, { ticks, labelBox }]) => {
        var _a;
        const axisSpec = axisSpecs.get(axisId);
        if (axisSpec) {
            const vertical = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position);
            const axisStyle = (_a = axesStyles.get(axisId)) !== null && _a !== void 0 ? _a : sharedAxesStyle;
            const { dimensions, topIncrement, bottomIncrement, leftIncrement, rightIncrement } = getPosition(chartDims, chartMargins, axisStyle, axisSpec, labelBox, smScales, acc);
            acc.top += topIncrement;
            acc.bottom += bottomIncrement;
            acc.left += leftIncrement;
            acc.right += rightIncrement;
            acc.geoms.push({
                axis: { id: axisSpec.id, position: axisSpec.position },
                anchorPoint: { x: dimensions.left, y: dimensions.top },
                dimension: labelBox,
                visibleTicks: ticks,
                parentSize: { height: dimensions.height, width: dimensions.width },
                size: {
                    width: labelBox.isHidden ? 0 : vertical ? dimensions.width : panel.width,
                    height: labelBox.isHidden ? 0 : vertical ? panel.height : dimensions.height,
                },
            });
        }
        else {
            throw new Error(`Cannot compute scale for axis spec ${axisId}`);
        }
        return acc;
    }, { geoms: [], top: 0, bottom: chartPaddings.bottom, left: chartDims.leftMargin, right: chartPaddings.right }).geoms;
}
exports.getAxesGeometries = getAxesGeometries;
//# sourceMappingURL=axis_utils.js.map