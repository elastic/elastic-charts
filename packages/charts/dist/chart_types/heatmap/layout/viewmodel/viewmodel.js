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
exports.isRasterTimeScale = exports.shapeViewModel = void 0;
var d3_array_1 = require("d3-array");
var d3_scale_1 = require("d3-scale");
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var fill_text_color_1 = require("../../../../common/fill_text_color");
var text_utils_1 = require("../../../../common/text_utils");
var constants_1 = require("../../../../scales/constants");
var elasticsearch_1 = require("../../../../utils/chrono/elasticsearch");
var common_1 = require("../../../../utils/common");
var dimensions_1 = require("../../../../utils/dimensions");
var logger_1 = require("../../../../utils/logger");
function getValuesInRange(values, startValue, endValue) {
    var startIndex = values.indexOf(startValue);
    var endIndex = Math.min(values.indexOf(endValue) + 1, values.length);
    return values.slice(startIndex, endIndex);
}
function shapeViewModel(textMeasure, spec, _a, elementSizes, heatmapTable, colorScale, bandsToHide) {
    var _b, _c;
    var heatmapTheme = _a.heatmap, axisTitle = _a.axes.axisTitle, background = _a.background;
    var gridStrokeWidth = (_b = heatmapTheme.grid.stroke.width) !== null && _b !== void 0 ? _b : 1;
    var table = heatmapTable.table, yValues = heatmapTable.yValues, xValues = heatmapTable.xValues;
    var boxedYValues = yValues.map(function (value) { return (__assign({ text: spec.yAxisLabelFormatter(value), value: value, isValue: false }, heatmapTheme.yAxisLabel)); });
    var yScale = (0, d3_scale_1.scaleBand)().domain(yValues).range([0, elementSizes.fullHeatmapHeight]);
    var yInvertedScale = (0, d3_scale_1.scaleQuantize)()
        .domain([0, elementSizes.fullHeatmapHeight])
        .range(yValues);
    var xScale = (0, d3_scale_1.scaleBand)().domain(xValues).range([0, elementSizes.grid.width]);
    var xInvertedScale = (0, d3_scale_1.scaleQuantize)()
        .domain([0, elementSizes.grid.width])
        .range(xValues);
    var cellWidth = heatmapTheme.cell.maxWidth !== 'fill' && xScale.bandwidth() > heatmapTheme.cell.maxWidth
        ? heatmapTheme.cell.maxWidth
        : xScale.bandwidth();
    var cellHeight = yScale.bandwidth();
    var currentGridHeight = elementSizes.grid.height;
    var textXValues = getXTicks(spec, heatmapTheme.xAxisLabel, xScale, heatmapTable.xValues);
    var padding = heatmapTheme.yAxisLabel.padding;
    var textYValues = boxedYValues.map(function (d) {
        return __assign(__assign({}, d), { x: -(0, dimensions_1.pad)(padding, 'right'), y: cellHeight / 2 + (yScale(d.value) || 0), align: 'right' });
    });
    var cellWidthInner = cellWidth - gridStrokeWidth;
    var cellHeightInner = cellHeight - gridStrokeWidth;
    if ((0, color_library_wrappers_1.colorToRgba)(background.color)[3] < 1) {
        logger_1.Logger.expected('Text contrast requires a opaque background color, using fallbackColor', 'an opaque color', background.color);
    }
    var cellMap = table.reduce(function (acc, d) {
        var x = xScale(String(d.x));
        var y = yScale(String(d.y));
        var yIndex = yValues.indexOf(d.y);
        if (!(0, common_1.isFiniteNumber)(x) || !(0, common_1.isFiniteNumber)(y) || yIndex === -1) {
            return acc;
        }
        var cellBackgroundColor = colorScale(d.value);
        var cellKey = getCellKey(d.x, d.y);
        var formattedValue = spec.valueFormatter(d.value);
        var fontSize = (0, text_utils_1.maximiseFontSize)(textMeasure, formattedValue, heatmapTheme.cell.label, heatmapTheme.cell.label.minFontSize, heatmapTheme.cell.label.maxFontSize, cellWidthInner - 6, cellHeightInner - 6);
        acc[cellKey] = {
            x: (heatmapTheme.cell.maxWidth !== 'fill' ? x + xScale.bandwidth() / 2 - heatmapTheme.cell.maxWidth / 2 : x) +
                gridStrokeWidth / 2,
            y: y + gridStrokeWidth / 2,
            yIndex: yIndex,
            width: cellWidthInner,
            height: cellHeightInner,
            datum: d,
            fill: {
                color: (0, color_library_wrappers_1.colorToRgba)(cellBackgroundColor),
            },
            stroke: {
                color: (0, color_library_wrappers_1.colorToRgba)(heatmapTheme.cell.border.stroke),
                width: heatmapTheme.cell.border.strokeWidth,
            },
            value: d.value,
            visible: !isValueHidden(d.value, bandsToHide),
            formatted: formattedValue,
            fontSize: fontSize,
            textColor: (0, fill_text_color_1.fillTextColor)(background.fallbackColor, cellBackgroundColor, background.color),
        };
        return acc;
    }, {});
    var pickGridCell = function (x, y) {
        if (x < elementSizes.grid.left || y < elementSizes.grid.top)
            return undefined;
        if (x > elementSizes.grid.width + elementSizes.grid.left || y > elementSizes.grid.top + elementSizes.grid.height)
            return undefined;
        var xValue = xInvertedScale(x - elementSizes.grid.left);
        var yValue = yInvertedScale(y);
        if (xValue === undefined || yValue === undefined)
            return undefined;
        return { x: xValue, y: yValue };
    };
    var pickQuads = function (x, y) {
        if (x > 0 &&
            x < elementSizes.grid.left &&
            y > elementSizes.grid.top &&
            y < elementSizes.grid.top + elementSizes.grid.height) {
            var yLabelKey_1 = yInvertedScale(y);
            var yLabelValue = textYValues.find(function (v) { return v.value === yLabelKey_1; });
            if (yLabelValue) {
                return yLabelValue;
            }
        }
        if (x < elementSizes.grid.left || y < elementSizes.grid.top) {
            return [];
        }
        if (x > elementSizes.grid.width + elementSizes.grid.left || y > elementSizes.grid.top + elementSizes.grid.height) {
            return [];
        }
        var xValue = xInvertedScale(x - elementSizes.grid.left);
        var yValue = yInvertedScale(y);
        if (xValue === undefined || yValue === undefined) {
            return [];
        }
        var cellKey = getCellKey(xValue, yValue);
        var cell = cellMap[cellKey];
        if (cell) {
            return [cell];
        }
        return [];
    };
    var pickDragArea = function (bound) {
        var _a = __read(bound, 2), start = _a[0], end = _a[1];
        var _b = elementSizes.grid, left = _b.left, top = _b.top, width = _b.width;
        var topLeft = [Math.min(start.x, end.x) - left, Math.min(start.y, end.y) - top];
        var bottomRight = [Math.max(start.x, end.x) - left, Math.max(start.y, end.y) - top];
        var startX = xInvertedScale((0, common_1.clamp)(topLeft[0], 0, width));
        var endX = xInvertedScale((0, common_1.clamp)(bottomRight[0], 0, width));
        var startY = yInvertedScale((0, common_1.clamp)(topLeft[1], 0, currentGridHeight - 1));
        var endY = yInvertedScale((0, common_1.clamp)(bottomRight[1], 0, currentGridHeight - 1));
        var allXValuesInRange = getValuesInRange(xValues, startX, endX);
        var allYValuesInRange = getValuesInRange(yValues, startY, endY);
        var invertedXValues = isRasterTimeScale(spec.xScale) && typeof endX === 'number'
            ? [startX, (0, elasticsearch_1.addIntervalToTime)(endX, spec.xScale.interval, spec.timeZone)]
            : __spreadArray([], __read(allXValuesInRange), false);
        var cells = [];
        allXValuesInRange.forEach(function (x) {
            allYValuesInRange.forEach(function (y) {
                var cellKey = getCellKey(x, y);
                cells.push(cellMap[cellKey]);
            });
        });
        return {
            cells: cells.filter(Boolean),
            x: invertedXValues,
            y: allYValuesInRange,
        };
    };
    var pickHighlightedArea = function (x, y) {
        var startValue = x[0];
        var endValue = x[x.length - 1];
        var leftIndex = typeof startValue === 'number' ? (0, d3_array_1.bisectLeft)(xValues, startValue) : xValues.indexOf(startValue);
        var rightIndex = typeof endValue === 'number' ? (0, d3_array_1.bisectLeft)(xValues, endValue) : xValues.indexOf(endValue) + 1;
        var isRightOutOfRange = rightIndex > xValues.length - 1 || rightIndex < 0;
        var isLeftOutOfRange = leftIndex > xValues.length - 1 || leftIndex < 0;
        var startFromScale = xScale(isLeftOutOfRange ? xValues[0] : xValues[leftIndex]);
        var endFromScale = xScale(isRightOutOfRange ? xValues[xValues.length - 1] : xValues[rightIndex]);
        if (startFromScale === undefined || endFromScale === undefined) {
            return null;
        }
        var xStart = elementSizes.grid.left + startFromScale;
        var width = endFromScale - startFromScale + (isRightOutOfRange || isLeftOutOfRange ? cellWidth : 0);
        var _a = y
            .filter(function (v) { return yValues.includes(v); })
            .reduce(function (acc, current, i) {
            if (i === 0) {
                acc.y = yScale(current) || 0;
            }
            acc.totalHeight += cellHeight;
            return acc;
        }, { y: 0, totalHeight: 0 }), yStart = _a.y, totalHeight = _a.totalHeight;
        return {
            x: xStart,
            y: yStart,
            width: width,
            height: totalHeight,
        };
    };
    var pickDragShape = function (bound) {
        var area = pickDragArea(bound);
        return pickHighlightedArea(area.x, area.y);
    };
    var pickCursorBand = function (x) {
        var _a;
        var roundedValue = isRasterTimeScale(spec.xScale) && (0, common_1.isFiniteNumber)(x)
            ? (0, elasticsearch_1.roundDateToESInterval)(x, spec.xScale.interval, 'start', spec.timeZone)
            : x;
        var index = xValues.indexOf(roundedValue);
        return index < 0
            ? undefined
            : {
                width: cellWidth,
                x: elementSizes.grid.left + ((_a = xScale(xValues[index])) !== null && _a !== void 0 ? _a : NaN),
                y: elementSizes.grid.top,
                height: elementSizes.grid.height,
            };
    };
    var xLines = Array.from({ length: xValues.length + 1 }, function (d, i) {
        var xAxisExtension = i % elementSizes.xAxisTickCadence === 0 ? 5 : 0;
        return {
            x1: elementSizes.grid.left + i * cellWidth,
            x2: elementSizes.grid.left + i * cellWidth,
            y1: elementSizes.grid.top,
            y2: currentGridHeight + xAxisExtension,
        };
    });
    var yLines = Array.from({ length: elementSizes.visibleNumberOfRows + 1 }, function (d, i) { return ({
        x1: elementSizes.grid.left,
        x2: elementSizes.grid.left + elementSizes.grid.width,
        y1: elementSizes.grid.top + i * cellHeight,
        y2: elementSizes.grid.top + i * cellHeight,
    }); });
    var cells = Object.values(cellMap);
    var tableMinFontSize = cells.reduce(function (acc, _a) {
        var fontSize = _a.fontSize;
        return Math.min(acc, fontSize);
    }, Infinity);
    var axisTitleFont = {
        visible: axisTitle.visible,
        fontFamily: axisTitle.fontFamily,
        fontStyle: (_c = axisTitle.fontStyle) !== null && _c !== void 0 ? _c : 'normal',
        fontVariant: 'normal',
        fontWeight: 'bold',
        textColor: axisTitle.fill,
        fontSize: axisTitle.fontSize,
    };
    return {
        theme: heatmapTheme,
        heatmapViewModel: {
            gridOrigin: {
                x: elementSizes.grid.left,
                y: elementSizes.grid.top,
            },
            gridLines: {
                x: xLines,
                y: yLines,
                stroke: {
                    color: (0, color_library_wrappers_1.colorToRgba)(heatmapTheme.grid.stroke.color),
                    width: gridStrokeWidth,
                },
            },
            pageSize: elementSizes.visibleNumberOfRows,
            cells: cells,
            cellFontSize: function (cell) { return (heatmapTheme.cell.label.useGlobalMinFontSize ? tableMinFontSize : cell.fontSize); },
            xValues: textXValues,
            yValues: textYValues,
            titles: [
                __assign(__assign({ origin: {
                        x: elementSizes.grid.left + elementSizes.grid.width / 2,
                        y: elementSizes.grid.top +
                            elementSizes.grid.height +
                            elementSizes.xAxis.height +
                            (0, dimensions_1.innerPad)(axisTitle.padding) +
                            axisTitle.fontSize / 2,
                    } }, axisTitleFont), { text: spec.xAxisTitle, rotation: 0 }),
                __assign(__assign({ origin: {
                        x: elementSizes.yAxis.left - (0, dimensions_1.innerPad)(axisTitle.padding) - axisTitle.fontSize / 2,
                        y: elementSizes.grid.top + elementSizes.grid.height / 2,
                    } }, axisTitleFont), { text: spec.yAxisTitle, rotation: -90 }),
            ],
        },
        pickGridCell: pickGridCell,
        pickQuads: pickQuads,
        pickDragArea: pickDragArea,
        pickDragShape: pickDragShape,
        pickHighlightedArea: pickHighlightedArea,
        pickCursorBand: pickCursorBand,
    };
}
exports.shapeViewModel = shapeViewModel;
function getCellKey(x, y) {
    return [String(x), String(y)].join('&_&');
}
function isValueHidden(value, rangesToHide) {
    return rangesToHide.some(function (_a) {
        var _b = __read(_a, 2), min = _b[0], max = _b[1];
        return min <= value && value < max;
    });
}
function isRasterTimeScale(scale) {
    return scale.type === constants_1.ScaleType.Time;
}
exports.isRasterTimeScale = isRasterTimeScale;
function getXTicks(spec, style, scale, values) {
    var isTimeScale = isRasterTimeScale(spec.xScale);
    var isRotated = style.rotation !== 0;
    return values.map(function (value) {
        var _a;
        return __assign(__assign({ text: spec.xAxisLabelFormatter(value), value: value, isValue: false }, style), { y: style.fontSize / 2 + (0, dimensions_1.pad)(style.padding, 'top'), x: ((_a = scale(value)) !== null && _a !== void 0 ? _a : 0) + (isTimeScale ? 0 : scale.bandwidth() / 2), align: isRotated ? 'right' : isTimeScale ? 'left' : 'center' });
    });
}
//# sourceMappingURL=viewmodel.js.map