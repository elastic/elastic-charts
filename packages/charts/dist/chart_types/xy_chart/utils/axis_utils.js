"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxesGeometries = exports.shouldShowTicks = exports.getPosition = exports.getAllAxisLayersGirth = exports.getTitleDimension = exports.getTickLabelPosition = exports.computeRotatedLabelDimensions = exports.getScaleForAxisSpec = exports.isXDomain = exports.defaultTickFormatter = void 0;
var common_1 = require("../../../utils/common");
var dimensions_1 = require("../../../utils/dimensions");
var line_1 = require("../renderer/canvas/primitives/line");
var axis_type_utils_1 = require("./axis_type_utils");
var panel_1 = require("./panel");
var scales_1 = require("./scales");
var defaultTickFormatter = function (tick) { return "".concat(tick); };
exports.defaultTickFormatter = defaultTickFormatter;
function isXDomain(position, chartRotation) {
    return (0, axis_type_utils_1.isHorizontalAxis)(position) === (chartRotation % 180 === 0);
}
exports.isXDomain = isXDomain;
function getScaleForAxisSpec(_a, _b, totalBarsInCluster, barsPadding, enableHistogramMode) {
    var xDomain = _a.xDomain, yDomains = _a.yDomains;
    var chartRotation = _b.rotation;
    return function (_a, range) {
        var _b;
        var groupId = _a.groupId, integersOnly = _a.integersOnly, position = _a.position;
        return isXDomain(position, chartRotation)
            ? (0, scales_1.computeXScale)({ xDomain: xDomain, totalBarsInCluster: totalBarsInCluster, range: range, barsPadding: barsPadding, enableHistogramMode: enableHistogramMode, integersOnly: integersOnly })
            : (_b = (0, scales_1.computeYScales)({ yDomains: yDomains, range: range, integersOnly: integersOnly }).get(groupId)) !== null && _b !== void 0 ? _b : null;
    };
}
exports.getScaleForAxisSpec = getScaleForAxisSpec;
function computeRotatedLabelDimensions(unrotatedDims, degreesRotation) {
    var width = unrotatedDims.width, height = unrotatedDims.height;
    var radians = (0, common_1.degToRad)(degreesRotation);
    var rotatedHeight = Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
    var rotatedWidth = Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians));
    return { width: rotatedWidth, height: rotatedHeight };
}
exports.computeRotatedLabelDimensions = computeRotatedLabelDimensions;
function getUserTextOffsets(dimensions, _a) {
    var x = _a.x, y = _a.y, reference = _a.reference;
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
var horizontalOffsetMultiplier = (_a = {},
    _a[common_1.HorizontalAlignment.Left] = -1,
    _a[common_1.HorizontalAlignment.Right] = 1,
    _a[common_1.HorizontalAlignment.Center] = 0,
    _a);
var verticalOffsetMultiplier = (_b = {},
    _b[common_1.VerticalAlignment.Top] = -1,
    _b[common_1.VerticalAlignment.Bottom] = 1,
    _b[common_1.VerticalAlignment.Middle] = 0,
    _b);
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
function getTickLabelPosition(_a, tickPosition, pos, rotation, axisSize, tickDimensions, showTicks, textOffset, textAlignment) {
    var tickLine = _a.tickLine, tickLabel = _a.tickLabel;
    var maxLabelBboxWidth = tickDimensions.maxLabelBboxWidth, maxLabelTextWidth = tickDimensions.maxLabelTextWidth, maxLabelBboxHeight = tickDimensions.maxLabelBboxHeight, maxLabelTextHeight = tickDimensions.maxLabelTextHeight;
    var tickDimension = showTicks ? tickLine.size + tickLine.padding : 0;
    var labelInnerPadding = (0, dimensions_1.innerPad)(tickLabel.padding);
    var horizontalAlign = getHorizontalAlign(pos, rotation, textAlignment.horizontal);
    var verticalAlign = getVerticalAlign(pos, rotation, textAlignment.vertical);
    var userOffsets = getUserTextOffsets(tickDimensions, textOffset);
    var paddedTickDimension = tickDimension + labelInnerPadding;
    var axisNetSize = ((0, axis_type_utils_1.isVerticalAxis)(pos) ? axisSize.width : axisSize.height) - paddedTickDimension;
    var labelBoxHalfGirth = (0, axis_type_utils_1.isHorizontalAxis)(pos) ? maxLabelBboxHeight / 2 : maxLabelBboxWidth / 2;
    var labelHalfWidth = maxLabelTextWidth / 2;
    return {
        horizontalAlign: horizontalAlign,
        verticalAlign: verticalAlign,
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
function getTitleDimension(_a) {
    var visible = _a.visible, fontSize = _a.fontSize, padding = _a.padding;
    return visible && fontSize > 0 ? (0, dimensions_1.innerPad)(padding) + fontSize + (0, dimensions_1.outerPad)(padding) : 0;
}
exports.getTitleDimension = getTitleDimension;
var getAllAxisLayersGirth = function (timeAxisLayerCount, maxLabelBoxGirth, axisHorizontal) {
    var axisLayerCount = timeAxisLayerCount > 0 && axisHorizontal ? timeAxisLayerCount : 1;
    return axisLayerCount * maxLabelBoxGirth;
};
exports.getAllAxisLayersGirth = getAllAxisLayersGirth;
function getPosition(_a, chartMargins, _b, _c, _d, smScales, _e) {
    var chartDimensions = _a.chartDimensions;
    var axisTitle = _b.axisTitle, axisPanelTitle = _b.axisPanelTitle, tickLine = _b.tickLine, tickLabel = _b.tickLabel;
    var title = _c.title, position = _c.position, hide = _c.hide, timeAxisLayerCount = _c.timeAxisLayerCount;
    var maxLabelBboxHeight = _d.maxLabelBboxHeight, maxLabelBboxWidth = _d.maxLabelBboxWidth;
    var cumTopSum = _e.top, cumBottomSum = _e.bottom, cumLeftSum = _e.left, cumRightSum = _e.right;
    var tickDimension = shouldShowTicks(tickLine, hide) ? tickLine.size + tickLine.padding : 0;
    var labelPaddingSum = tickLabel.visible ? (0, dimensions_1.innerPad)(tickLabel.padding) + (0, dimensions_1.outerPad)(tickLabel.padding) : 0;
    var titleDimension = title ? getTitleDimension(axisTitle) : 0;
    var vertical = (0, axis_type_utils_1.isVerticalAxis)(position);
    var scaleBand = vertical ? smScales.vertical : smScales.horizontal;
    var panelTitleDimension = (0, panel_1.hasSMDomain)(scaleBand) ? getTitleDimension(axisPanelTitle) : 0;
    var maxLabelBboxGirth = tickLabel.visible ? (vertical ? maxLabelBboxWidth : maxLabelBboxHeight) : 0;
    var shownLabelSize = (0, exports.getAllAxisLayersGirth)(timeAxisLayerCount, maxLabelBboxGirth, !vertical);
    var parallelSize = labelPaddingSum + shownLabelSize + tickDimension + titleDimension + panelTitleDimension;
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
function shouldShowTicks(_a, axisHidden) {
    var visible = _a.visible, strokeWidth = _a.strokeWidth, size = _a.size;
    return !axisHidden && visible && size > 0 && strokeWidth >= line_1.MIN_STROKE_WIDTH;
}
exports.shouldShowTicks = shouldShowTicks;
function getAxesGeometries(chartDims, _a, axisSpecs, axesStyles, smScales, totalGroupsCount, enableHistogramMode, visibleTicksSet) {
    var chartPaddings = _a.chartPaddings, chartMargins = _a.chartMargins, sharedAxesStyle = _a.axes;
    var panel = (0, panel_1.getPanelSize)(smScales);
    return __spreadArray([], __read(visibleTicksSet), false).reduce(function (acc, _a) {
        var _b;
        var _c = __read(_a, 2), axisId = _c[0], _d = _c[1], ticks = _d.ticks, labelBox = _d.labelBox;
        var axisSpec = axisSpecs.get(axisId);
        if (axisSpec) {
            var vertical = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position);
            var axisStyle = (_b = axesStyles.get(axisId)) !== null && _b !== void 0 ? _b : sharedAxesStyle;
            var axisPositionData = getPosition(chartDims, chartMargins, axisStyle, axisSpec, labelBox, smScales, acc);
            var dimensions = axisPositionData.dimensions, topIncrement = axisPositionData.topIncrement, bottomIncrement = axisPositionData.bottomIncrement, leftIncrement = axisPositionData.leftIncrement, rightIncrement = axisPositionData.rightIncrement;
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
            throw new Error("Cannot compute scale for axis spec ".concat(axisId));
        }
        return acc;
    }, { geoms: [], top: 0, bottom: chartPaddings.bottom, left: chartDims.leftMargin, right: chartPaddings.right }).geoms;
}
exports.getAxesGeometries = getAxesGeometries;
//# sourceMappingURL=axis_utils.js.map