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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeChartElementSizesSelector = void 0;
var d3_scale_1 = require("d3-scale");
var math_1 = require("../../../../common/math");
var vectors_1 = require("../../../../common/vectors");
var screenspace_marker_scale_compressor_1 = require("../../../../solvers/screenspace_marker_scale_compressor");
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_legend_size_1 = require("../../../../state/selectors/get_legend_size");
var canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
var common_1 = require("../../../../utils/common");
var dimensions_1 = require("../../../../utils/dimensions");
var legend_1 = require("../../../../utils/legend");
var viewmodel_1 = require("../../layout/viewmodel/viewmodel");
var get_heatmap_spec_1 = require("./get_heatmap_spec");
var get_heatmap_table_1 = require("./get_heatmap_table");
var getParentDimension = function (state) { return state.parentDimensions; };
exports.computeChartElementSizesSelector = (0, create_selector_1.createCustomCachedSelector)([getParentDimension, get_legend_size_1.getLegendSizeSelector, get_heatmap_table_1.getHeatmapTableSelector, get_chart_theme_1.getChartThemeSelector, get_heatmap_spec_1.getHeatmapSpecSelector], function (container, legendSize, _a, _b, _c) {
    var yValues = _a.yValues, xValues = _a.xValues;
    var heatmap = _b.heatmap, axisTitleStyle = _b.axes.axisTitle;
    var xAxisTitle = _c.xAxisTitle, yAxisTitle = _c.yAxisTitle, xAxisLabelFormatter = _c.xAxisLabelFormatter, yAxisLabelFormatter = _c.yAxisLabelFormatter, xScale = _c.xScale;
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)(function (textMeasure) {
        var _a;
        var isLegendHorizontal = (0, legend_1.isHorizontalLegend)(legendSize.position);
        var legendWidth = !isLegendHorizontal ? legendSize.width + legendSize.margin * 2 : 0;
        var legendHeight = isLegendHorizontal
            ? (_a = heatmap.maxLegendHeight) !== null && _a !== void 0 ? _a : legendSize.height + legendSize.margin * 2
            : 0;
        var yAxisTitleHorizontalSize = getTextSizeDimension(yAxisTitle, axisTitleStyle, textMeasure, 'height');
        var yAxisWidth = getYAxisHorizontalUsedSpace(yValues, heatmap.yAxisLabel, yAxisLabelFormatter, textMeasure);
        var xAxisTitleVerticalSize = getTextSizeDimension(xAxisTitle, axisTitleStyle, textMeasure, 'height');
        var xAxisSize = getXAxisSize(!(0, viewmodel_1.isRasterTimeScale)(xScale), heatmap.xAxisLabel, xAxisLabelFormatter, xValues, textMeasure, container.width - legendWidth - heatmap.grid.stroke.width / 2, [
            yAxisTitleHorizontalSize + yAxisWidth,
            0,
        ]);
        var availableHeightForGrid = container.height - xAxisTitleVerticalSize - xAxisSize.height - legendHeight - heatmap.grid.stroke.width / 2;
        var rowHeight = getGridCellHeight(yValues.length, heatmap.grid, availableHeightForGrid);
        var fullHeatmapHeight = rowHeight * yValues.length;
        var visibleNumberOfRows = rowHeight > 0 && fullHeatmapHeight > availableHeightForGrid
            ? Math.floor(availableHeightForGrid / rowHeight)
            : yValues.length;
        var grid = {
            width: xAxisSize.width,
            height: visibleNumberOfRows * rowHeight - heatmap.grid.stroke.width / 2,
            left: container.left + xAxisSize.left,
            top: container.top + heatmap.grid.stroke.width / 2,
        };
        var yAxis = {
            width: yAxisWidth,
            height: grid.height,
            top: grid.top,
            left: grid.left - yAxisWidth,
        };
        var xAxis = {
            width: grid.width,
            height: xAxisSize.height,
            top: grid.top + grid.height,
            left: grid.left,
        };
        return {
            grid: grid,
            yAxis: yAxis,
            xAxis: xAxis,
            visibleNumberOfRows: visibleNumberOfRows,
            fullHeatmapHeight: fullHeatmapHeight,
            rowHeight: rowHeight,
            xAxisTickCadence: xAxisSize.tickCadence,
            xLabelRotation: xAxisSize.minRotation,
        };
    });
});
function getYAxisHorizontalUsedSpace(yValues, style, formatter, textMeasure) {
    if (!style.visible) {
        return 0;
    }
    if (typeof style.width === 'number' && (0, common_1.isFiniteNumber)(style.width)) {
        return style.width;
    }
    var longestLabelWidth = yValues.reduce(function (acc, value) {
        var width = textMeasure(formatter(value), style, style.fontSize).width;
        return Math.max(width + (0, dimensions_1.horizontalPad)(style.padding), acc);
    }, 0);
    return style.width === 'auto' ? longestLabelWidth : Math.min(longestLabelWidth, style.width.max);
}
function getTextSizeDimension(text, style, textMeasure, param) {
    var _a;
    if (!style.visible || text === '') {
        return 0;
    }
    var textPadding = (0, dimensions_1.innerPad)(style.padding) + (0, dimensions_1.outerPad)(style.padding);
    if (param === 'height') {
        return style.fontSize + textPadding;
    }
    var textBox = textMeasure(text, {
        fontFamily: style.fontFamily,
        fontVariant: 'normal',
        fontWeight: 'bold',
        fontStyle: (_a = style.fontStyle) !== null && _a !== void 0 ? _a : 'normal',
    }, style.fontSize);
    return textBox.width + textPadding;
}
function getGridCellHeight(rows, grid, height) {
    if (rows === 0) {
        return height;
    }
    var stretchedHeight = height / rows;
    if (stretchedHeight < grid.cellHeight.min) {
        return grid.cellHeight.min;
    }
    if (grid.cellHeight.max !== 'fill' && stretchedHeight > grid.cellHeight.max) {
        return grid.cellHeight.max;
    }
    return stretchedHeight;
}
function getXAxisSize(isCategoricalScale, style, formatter, labels, textMeasure, containerWidth, surroundingSpace) {
    if (!style.visible) {
        return {
            height: 0,
            width: Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
            left: surroundingSpace[0],
            right: surroundingSpace[1],
            tickCadence: NaN,
            minRotation: 0,
        };
    }
    var isRotated = style.rotation !== 0;
    var normalizedScale = (0, d3_scale_1.scaleBand)().domain(labels).range([0, 1]);
    var alignment = isRotated ? 'right' : isCategoricalScale ? 'center' : 'left';
    var alignmentOffset = isCategoricalScale ? normalizedScale.bandwidth() / 2 : 0;
    var scale = function (d) { var _a; return ((_a = normalizedScale(d)) !== null && _a !== void 0 ? _a : 0) + alignmentOffset; };
    var rotationRad = (0, common_1.degToRad)(style.rotation);
    var measuredLabels = labels.map(function (label) { return (__assign(__assign({}, textMeasure(formatter(label), style, style.fontSize)), { label: label })); });
    if (isCategoricalScale || isRotated) {
        var maxLabelBBox = measuredLabels.reduce(function (acc, curr) {
            return {
                height: Math.max(acc.height, curr.height),
                width: Math.max(acc.width, curr.width),
            };
        }, { height: 0, width: 0 });
        var compressedScale = computeCompressedScale(style, scale, measuredLabels, containerWidth, surroundingSpace, alignment, rotationRad);
        var scaleStep = compressedScale.width / labels.length;
        var optimalRotation = scaleStep > maxLabelBBox.width ? 0 : Math.asin(Math.min(maxLabelBBox.height / scaleStep, 1));
        var _a = __assign(__assign({}, (rotationRad !== 0 && optimalRotation > rotationRad
            ? computeCompressedScale(style, scale, measuredLabels, containerWidth, surroundingSpace, alignment, optimalRotation)
            : compressedScale)), { minRotation: isRotated ? Math.max(optimalRotation, rotationRad) : 0 }), width = _a.width, height = _a.height, left = _a.left, right = _a.right, minRotation = _a.minRotation;
        var validCompression = (0, common_1.isFiniteNumber)(width);
        return {
            height: validCompression ? height : 0,
            width: validCompression ? width : Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
            left: validCompression ? left : surroundingSpace[0],
            right: validCompression ? right : surroundingSpace[1],
            tickCadence: validCompression ? 1 : NaN,
            minRotation: minRotation,
        };
    }
    var tickCadence = 1;
    var dimension = computeCompressedScale(style, scale, measuredLabels, containerWidth, surroundingSpace, alignment, rotationRad);
    var _loop_1 = function (i) {
        if ((!dimension.overlaps && !dimension.overflow.right) || !(0, common_1.isFiniteNumber)(dimension.width)) {
            return "break";
        }
        dimension = computeCompressedScale(style, scale, measuredLabels.filter(function (_, index) { return index % (i + 1) === 0; }), containerWidth, surroundingSpace, alignment, rotationRad);
        tickCadence++;
    };
    for (var i = 1; i < measuredLabels.length; i++) {
        var state_1 = _loop_1(i);
        if (state_1 === "break")
            break;
    }
    if (!(0, common_1.isFiniteNumber)(dimension.width)) {
        return {
            height: 0,
            width: Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
            left: surroundingSpace[0],
            right: surroundingSpace[1],
            tickCadence: NaN,
            minRotation: rotationRad,
        };
    }
    return __assign(__assign({}, dimension), { tickCadence: tickCadence, minRotation: rotationRad });
}
function computeCompressedScale(style, scale, labels, containerWidth, surroundingSpace, alignment, rotation) {
    var _a = labels.reduce(function (acc, _a) {
        var width = _a.width, height = _a.height, label = _a.label;
        var labelRect = [
            [0, 0],
            [width, 0],
            [width, height],
            [0, height],
        ];
        var rotationOrigin = alignment === 'right' ? [width, height / 2] : alignment === 'left' ? [0, height / 2] : [width / 2, height / 2];
        var rotatedVectors = labelRect.map(function (vector) { return (0, vectors_1.rotate2)(rotation, (0, vectors_1.sub2)(vector, rotationOrigin)); });
        var x = (0, math_1.extent)(rotatedVectors.map(function (v) { return v[0]; }));
        var y = (0, math_1.extent)(rotatedVectors.map(function (v) { return v[1]; }));
        acc.wMax = Math.max(acc.wMax, Math.abs(x[1] - x[0]));
        acc.hMax = Math.max(acc.hMax, Math.abs(y[1] - y[0]));
        acc.itemsPerSideSize.push([Math.abs(x[0]), Math.abs(x[1])]);
        var domainPosition = scale(label);
        acc.domainPositions.push(domainPosition);
        return acc;
    }, { wMax: -Infinity, hMax: -Infinity, itemsPerSideSize: [], domainPositions: [] }), itemsPerSideSize = _a.itemsPerSideSize, domainPositions = _a.domainPositions, hMax = _a.hMax;
    var globalDomainPositions = __spreadArray(__spreadArray([0], __read(domainPositions), false), [1], false);
    var globalItemWidth = __spreadArray(__spreadArray([[surroundingSpace[0], 0]], __read(itemsPerSideSize), false), [[0, surroundingSpace[1]]], false);
    var _b = (0, screenspace_marker_scale_compressor_1.screenspaceMarkerScaleCompressor)(globalDomainPositions, globalItemWidth, containerWidth), scaleMultiplier = _b.scaleMultiplier, bounds = _b.bounds;
    var overlaps = itemsPerSideSize.some(function (_a, i) {
        var _b = __read(_a, 2), rightSide = _b[1];
        if (i >= itemsPerSideSize.length - 2) {
            return false;
        }
        var currentItemRightSide = domainPositions[i] * scaleMultiplier + rightSide + (0, dimensions_1.pad)(style.padding, 'right');
        var nextItemLeftSize = domainPositions[i + 1] * scaleMultiplier - itemsPerSideSize[i + 1][0] - (0, dimensions_1.pad)(style.padding, 'left');
        return currentItemRightSide > nextItemLeftSize;
    });
    var leftMargin = (0, common_1.isFiniteNumber)(bounds[0])
        ? globalItemWidth[bounds[0]][0] - scaleMultiplier * globalDomainPositions[bounds[0]]
        : 0;
    var rightMargin = (0, common_1.isFiniteNumber)(bounds[1]) ? globalItemWidth[bounds[1]][1] : 0;
    return {
        width: scaleMultiplier,
        right: rightMargin,
        left: leftMargin,
        height: hMax + (0, dimensions_1.pad)(style.padding, 'top') + style.fontSize / 2,
        overlaps: overlaps,
        overflow: {
            left: bounds[0] !== 0,
            right: bounds[1] !== globalDomainPositions.length - 1,
        },
    };
}
//# sourceMappingURL=compute_chart_dimensions.js.map