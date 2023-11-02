"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRasterTimeScale = exports.isValueInRanges = exports.shapeViewModel = exports.clampWithOffset = void 0;
const d3_scale_1 = require("d3-scale");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const fill_text_color_1 = require("../../../../common/fill_text_color");
const panel_utils_1 = require("../../../../common/panel_utils");
const text_utils_1 = require("../../../../common/text_utils");
const constants_1 = require("../../../../scales/constants");
const elasticsearch_1 = require("../../../../utils/chrono/elasticsearch");
const common_1 = require("../../../../utils/common");
const dimensions_1 = require("../../../../utils/dimensions");
const logger_1 = require("../../../../utils/logger");
function getValuesInRange(values, startValue, endValue) {
    const startIndex = values.indexOf(startValue);
    const endIndex = Math.min(values.indexOf(endValue) + 1, values.length);
    return values.slice(startIndex, endIndex);
}
function clampWithOffset(value, lowerBound, upperBound, offset) {
    return (0, common_1.clamp)(value, lowerBound + offset, upperBound + offset) - offset;
}
exports.clampWithOffset = clampWithOffset;
function shapeViewModel(textMeasure, spec, { heatmap: heatmapTheme, axes: { axisTitle, axisPanelTitle }, background }, { chartDimensions }, elementSizes, heatmapTable, colorScale, smScales, groupBySpec, bandsToHide) {
    var _a, _b;
    const { table, yValues, xValues } = heatmapTable;
    const gridStrokeWidth = heatmapTheme.grid.stroke.width;
    const isPointerOverPanel = (0, panel_utils_1.isPointerOverPanelFn)(smScales, chartDimensions, gridStrokeWidth);
    const boxedYValues = yValues.map((value) => ({
        text: spec.yAxisLabelFormatter(value),
        value,
        isValue: false,
        ...heatmapTheme.yAxisLabel,
    }));
    const panelSize = (0, panel_utils_1.getPanelSize)(smScales);
    const yScale = (0, d3_scale_1.scaleBand)().domain(yValues).range([0, panelSize.height]);
    const yInvertedScale = (0, d3_scale_1.scaleQuantize)().domain([0, panelSize.height]).range(yValues);
    const xScale = (0, d3_scale_1.scaleBand)().domain(xValues).range([0, panelSize.width]);
    const xInvertedScale = (0, d3_scale_1.scaleQuantize)().domain([0, panelSize.width]).range(xValues);
    const cellWidth = heatmapTheme.cell.maxWidth !== 'fill' && xScale.bandwidth() > heatmapTheme.cell.maxWidth
        ? heatmapTheme.cell.maxWidth
        : xScale.bandwidth();
    const cellHeight = yScale.bandwidth();
    const textXValues = getXTicks(spec, heatmapTheme.xAxisLabel, xScale, heatmapTable.xValues);
    const { padding } = heatmapTheme.yAxisLabel;
    const textYValues = boxedYValues.map((d) => {
        return {
            ...d,
            x: -(0, dimensions_1.pad)(padding, 'right'),
            y: cellHeight / 2 + (yScale(d.value) || 0),
            align: 'right',
        };
    });
    const cellWidthInner = cellWidth - gridStrokeWidth;
    const cellHeightInner = cellHeight - gridStrokeWidth;
    if ((0, color_library_wrappers_1.colorToRgba)(background.color)[3] < 1) {
        logger_1.Logger.expected('Text contrast requires a opaque background color, using fallbackColor', 'an opaque color', background.color);
    }
    let tableMinFontSize = Infinity;
    const panelCellMap = table.reduce((acc, d) => {
        var _a;
        const x = xScale(String(d.x));
        const y = yScale(String(d.y));
        const yIndex = yValues.indexOf(d.y);
        if (!(0, common_1.isFiniteNumber)(x) || !(0, common_1.isFiniteNumber)(y) || yIndex === -1) {
            return acc;
        }
        const cellBackgroundColor = colorScale(d.value);
        const panelKey = getPanelKey(d.smHorizontalAccessorValue, d.smVerticalAccessorValue);
        const cellKey = getCellKey(d.x, d.y);
        const formattedValue = spec.valueFormatter(d.value);
        const fontSize = (0, text_utils_1.maximiseFontSize)(textMeasure, formattedValue, heatmapTheme.cell.label, heatmapTheme.cell.label.minFontSize, heatmapTheme.cell.label.maxFontSize, cellWidthInner - 6, cellHeightInner - 6);
        tableMinFontSize = Math.min(tableMinFontSize, fontSize);
        const cellMap = (_a = acc.get(panelKey)) !== null && _a !== void 0 ? _a : new Map();
        if (!acc.has(panelKey))
            acc.set(panelKey, cellMap);
        cellMap.set(cellKey, {
            x: (heatmapTheme.cell.maxWidth !== 'fill' ? x + xScale.bandwidth() / 2 - heatmapTheme.cell.maxWidth / 2 : x) +
                gridStrokeWidth / 2,
            y: y + gridStrokeWidth / 2,
            yIndex,
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
            visible: !isValueInRanges(d.value, bandsToHide),
            formatted: formattedValue,
            fontSize,
            textColor: (0, fill_text_color_1.fillTextColor)(background.fallbackColor, cellBackgroundColor, background.color).color.keyword,
        });
        return acc;
    }, new Map());
    const getScaledSMValue = (value, scale) => {
        return (0, panel_utils_1.hasSMDomain)(smScales[scale]) ? smScales[scale].scale(value) : 0;
    };
    const getPanelPointCoordinate = (value, scale) => {
        var _a;
        const category = (_a = smScales[scale].invert(value)) !== null && _a !== void 0 ? _a : '';
        const panelOffset = getScaledSMValue(category, scale);
        const invertedScale = scale === 'horizontal' ? xInvertedScale : yInvertedScale;
        return {
            category,
            panelOffset,
            panelPixelValue: value - panelOffset,
            panelValue: invertedScale(value - panelOffset),
        };
    };
    const getPanelPointCoordinates = (x, y) => {
        const { category: v, panelValue: panelY, panelOffset: panelOffsetY } = getPanelPointCoordinate(y, 'vertical');
        const { category: h, panelValue: panelX, panelOffset: panelOffsetX, } = getPanelPointCoordinate(x - chartDimensions.left, 'horizontal');
        return {
            x: panelX,
            y: panelY,
            v,
            h,
            panelOffsetY,
            panelOffsetX,
        };
    };
    const pickGridCell = (x, y) => {
        if (x < chartDimensions.left || y < chartDimensions.top)
            return undefined;
        if (x > chartDimensions.width + chartDimensions.left || y > chartDimensions.top + chartDimensions.height)
            return undefined;
        const xValue = xInvertedScale(x - chartDimensions.left);
        const yValue = yInvertedScale(y);
        if (xValue === undefined || yValue === undefined)
            return undefined;
        return { x: xValue, y: yValue };
    };
    const pickQuads = (x, y) => {
        var _a;
        if (x > 0 &&
            x < chartDimensions.left &&
            y > chartDimensions.top &&
            y < chartDimensions.top + chartDimensions.height) {
            const { y: yLabelKey } = getPanelPointCoordinates(x - chartDimensions.left, y);
            const yLabelValue = textYValues.find((v) => v.value === yLabelKey);
            if (yLabelValue) {
                return yLabelValue;
            }
        }
        if (!isPointerOverPanel({ x, y })) {
            return [];
        }
        const { x: panelXValue, y: panelYValue, h, v } = getPanelPointCoordinates(x, y);
        if (panelXValue === undefined || panelYValue === undefined) {
            return [];
        }
        const panelKey = getPanelKey(h, v);
        const cellKey = getCellKey(panelXValue, panelYValue);
        const cell = (_a = panelCellMap.get(panelKey)) === null || _a === void 0 ? void 0 : _a.get(cellKey);
        if (cell)
            return [cell];
        return [];
    };
    const pickDragArea = (bound) => {
        const [start, end] = bound;
        const { left, top } = chartDimensions;
        const topLeft = [Math.min(start.x, end.x) - left, Math.min(start.y, end.y) - top];
        const bottomRight = [Math.max(start.x, end.x) - left, Math.max(start.y, end.y) - top];
        const { category: smHorizontalAccessorValue, panelOffset: horizontalPanelOffset } = getPanelPointCoordinate(start.x - chartDimensions.left, 'horizontal');
        const { category: smVerticalAccessorValue, panelOffset: verticalPanelOffset } = getPanelPointCoordinate(start.y, 'vertical');
        const panelStartX = clampWithOffset(topLeft[0], 0, panelSize.width, horizontalPanelOffset);
        const panelStartY = clampWithOffset(topLeft[1], 0, panelSize.height, verticalPanelOffset);
        const panelEndX = clampWithOffset(bottomRight[0], 0, panelSize.width, horizontalPanelOffset);
        const panelEndY = clampWithOffset(bottomRight[1], 0, panelSize.height, verticalPanelOffset);
        const startX = xInvertedScale(panelStartX);
        const startY = yInvertedScale(panelStartY);
        const endX = xInvertedScale(panelEndX);
        const endY = yInvertedScale(panelEndY);
        const allXValuesInRange = getValuesInRange(xValues, startX, endX);
        const allYValuesInRange = getValuesInRange(yValues, startY, endY);
        const invertedXValues = isRasterTimeScale(spec.xScale) && typeof endX === 'number'
            ? [startX, (0, elasticsearch_1.addIntervalToTime)(endX, spec.xScale.interval, spec.timeZone)]
            : [...allXValuesInRange];
        const cells = [];
        allXValuesInRange.forEach((x) => {
            allYValuesInRange.forEach((y) => {
                var _a;
                const panelKey = getPanelKey(smHorizontalAccessorValue, smVerticalAccessorValue);
                const cellKey = getCellKey(x, y);
                const cellValue = (_a = panelCellMap.get(panelKey)) === null || _a === void 0 ? void 0 : _a.get(cellKey);
                if (cellValue)
                    cells.push(cellValue);
            });
        });
        return {
            cells: cells.filter(Boolean),
            x: invertedXValues,
            y: allYValuesInRange,
            smHorizontalAccessorValue,
            smVerticalAccessorValue,
        };
    };
    const pickHighlightedArea = (x, y, smHorizontalAccessorValue, smVerticalAccessorValue) => {
        var _a, _b;
        const startValue = x[0];
        const endValue = x.at(-1);
        const leftIndex = xValues.indexOf(startValue !== null && startValue !== void 0 ? startValue : NaN);
        const rightIndex = xValues.indexOf(endValue !== null && endValue !== void 0 ? endValue : NaN) + (isRasterTimeScale(spec.xScale) && x.length > 1 ? 0 : 1);
        const isRightOutOfRange = rightIndex > xValues.length - 1 || rightIndex < 0;
        const isLeftOutOfRange = leftIndex > xValues.length - 1 || leftIndex < 0;
        const startFromScale = xScale((_a = (isLeftOutOfRange ? xValues[0] : xValues[leftIndex])) !== null && _a !== void 0 ? _a : NaN);
        const endFromScale = xScale((_b = (isRightOutOfRange ? xValues.at(-1) : xValues[rightIndex])) !== null && _b !== void 0 ? _b : NaN);
        if (startFromScale === undefined || endFromScale === undefined) {
            return null;
        }
        const panelXOffset = (0, common_1.isNil)(smHorizontalAccessorValue)
            ? 0
            : getScaledSMValue(smHorizontalAccessorValue, 'horizontal');
        const panelYOffset = (0, common_1.isNil)(smVerticalAccessorValue) ? 0 : getScaledSMValue(smVerticalAccessorValue, 'vertical');
        const xStart = chartDimensions.left + startFromScale + panelXOffset;
        const width = endFromScale - startFromScale + (isRightOutOfRange || isLeftOutOfRange ? cellWidth : 0);
        const { y: yStart, totalHeight } = y
            .filter((v) => yValues.includes(v))
            .reduce((acc, current, i) => {
            if (i === 0) {
                acc.y = (yScale(current) || 0) + panelYOffset;
            }
            acc.totalHeight += cellHeight;
            return acc;
        }, { y: 0, totalHeight: 0 });
        return {
            x: xStart,
            y: yStart,
            width,
            height: totalHeight,
        };
    };
    const pickDragShape = (bound) => {
        const { x, y, smHorizontalAccessorValue, smVerticalAccessorValue } = pickDragArea(bound);
        return pickHighlightedArea(x, y, smHorizontalAccessorValue, smVerticalAccessorValue);
    };
    const pickCursorBand = (x) => {
        var _a, _b;
        const roundedValue = isRasterTimeScale(spec.xScale) && (0, common_1.isFiniteNumber)(x)
            ? (0, elasticsearch_1.roundDateToESInterval)(x, spec.xScale.interval, 'start', spec.timeZone)
            : x;
        const index = xValues.indexOf(roundedValue);
        return index < 0
            ? undefined
            : {
                width: cellWidth,
                x: chartDimensions.left + ((_b = xScale((_a = xValues[index]) !== null && _a !== void 0 ? _a : NaN)) !== null && _b !== void 0 ? _b : NaN),
                y: chartDimensions.top,
                height: chartDimensions.height,
            };
    };
    const xLines = Array.from({ length: xValues.length + 1 }, (d, i) => {
        const xAxisExtension = i % elementSizes.xAxisTickCadence === 0 ? 5 : 0;
        return {
            x1: i * cellWidth,
            x2: i * cellWidth,
            y1: 0,
            y2: panelSize.height + xAxisExtension,
        };
    });
    const yLines = Array.from({ length: yValues.length + 1 }, (d, i) => ({
        x1: 0,
        x2: panelSize.width,
        y1: i * cellHeight,
        y2: i * cellHeight,
    }));
    const axisTitleFont = {
        visible: axisTitle.visible,
        fontFamily: axisTitle.fontFamily,
        fontStyle: (_a = axisTitle.fontStyle) !== null && _a !== void 0 ? _a : 'normal',
        fontVariant: 'normal',
        fontWeight: 'bold',
        textColor: axisTitle.fill,
        fontSize: axisTitle.fontSize,
    };
    const axisPanelTitleFont = {
        visible: axisPanelTitle.visible,
        fontFamily: axisPanelTitle.fontFamily,
        fontStyle: (_b = axisPanelTitle.fontStyle) !== null && _b !== void 0 ? _b : 'normal',
        fontVariant: 'normal',
        fontWeight: 'bold',
        textColor: axisPanelTitle.fill,
        fontSize: axisPanelTitle.fontSize,
    };
    return {
        theme: heatmapTheme,
        heatmapViewModels: (0, panel_utils_1.getPerPanelMap)(smScales, (anchor, h, v) => {
            var _a, _b;
            const primaryColumn = smScales.vertical.domain[0] === v;
            const primaryRow = smScales.horizontal.domain[0] === h;
            const lastColumn = smScales.vertical.domain.at(-1) === v;
            const titles = [];
            const cells = [...((_b = (_a = panelCellMap.get(getPanelKey(h, v))) === null || _a === void 0 ? void 0 : _a.values()) !== null && _b !== void 0 ? _b : [])];
            if (primaryColumn && primaryRow) {
                if (spec.xAxisTitle) {
                    const axisPanelTitleHeight = groupBySpec.horizontal && axisPanelTitle.visible
                        ? axisPanelTitle.fontSize + (0, dimensions_1.innerPad)(axisPanelTitle.padding) / 2
                        : 0;
                    titles.push({
                        origin: {
                            x: chartDimensions.width / 2,
                            y: chartDimensions.top +
                                chartDimensions.height +
                                elementSizes.xAxis.height +
                                axisPanelTitleHeight +
                                (0, dimensions_1.innerPad)(axisTitle.padding) / 2 +
                                axisTitle.fontSize / 2,
                        },
                        ...axisTitleFont,
                        text: spec.xAxisTitle,
                        rotation: 0,
                    });
                }
                if (spec.yAxisTitle) {
                    titles.push({
                        origin: {
                            x: -chartDimensions.left + axisTitle.fontSize / 2,
                            y: chartDimensions.top + chartDimensions.height / 2,
                        },
                        ...axisTitleFont,
                        text: spec.yAxisTitle,
                        rotation: -90,
                    });
                }
            }
            if (primaryColumn && groupBySpec.horizontal) {
                titles.push({
                    origin: {
                        x: panelSize.width / 2,
                        y: chartDimensions.top +
                            chartDimensions.height +
                            elementSizes.xAxis.height +
                            (0, dimensions_1.innerPad)(axisPanelTitle.padding) +
                            axisPanelTitle.fontSize / 2,
                    },
                    ...axisPanelTitleFont,
                    text: (0, panel_utils_1.getPanelTitle)(false, v, h, groupBySpec),
                    rotation: 0,
                });
            }
            if (primaryRow && groupBySpec.vertical) {
                const axisTitleWidth = axisTitle.visible ? axisTitle.fontSize + (0, dimensions_1.innerPad)(axisTitle.padding) : 0;
                titles.push({
                    origin: {
                        x: -chartDimensions.left + axisTitleWidth + axisPanelTitle.fontSize / 2,
                        y: chartDimensions.top + panelSize.height / 2,
                    },
                    ...axisPanelTitleFont,
                    text: (0, panel_utils_1.getPanelTitle)(true, v, h, groupBySpec),
                    rotation: -90,
                });
            }
            return {
                anchor,
                panelSize,
                gridOrigin: {
                    x: anchor.x + chartDimensions.left,
                    y: anchor.y + chartDimensions.top,
                },
                gridLines: {
                    x: xLines,
                    y: yLines,
                    stroke: {
                        color: (0, color_library_wrappers_1.colorToRgba)(heatmapTheme.grid.stroke.color),
                        width: gridStrokeWidth,
                    },
                },
                cells,
                cellFontSize: (cell) => (heatmapTheme.cell.label.useGlobalMinFontSize ? tableMinFontSize : cell.fontSize),
                xValues: lastColumn ? textXValues : [],
                yValues: primaryRow ? textYValues : [],
                titles,
            };
        }),
        pickGridCell,
        pickQuads,
        pickDragArea,
        pickDragShape,
        pickHighlightedArea,
        pickCursorBand,
    };
}
exports.shapeViewModel = shapeViewModel;
function getCellKey(x, y) {
    return [String(x), String(y)].join('&_&');
}
function getPanelKey(h = '', v = '') {
    return [String(h), String(v)].join('&_&');
}
function isValueInRanges(value, ranges) {
    return ranges.some(([min, max]) => min <= value && value < max);
}
exports.isValueInRanges = isValueInRanges;
function isRasterTimeScale(scale) {
    return scale.type === constants_1.ScaleType.Time;
}
exports.isRasterTimeScale = isRasterTimeScale;
function getXTicks(spec, style, scale, values) {
    const isTimeScale = isRasterTimeScale(spec.xScale);
    const isRotated = style.rotation !== 0;
    return values.map((value) => {
        var _a;
        return {
            text: spec.xAxisLabelFormatter(value),
            value,
            isValue: false,
            ...style,
            y: style.fontSize / 2 + (0, dimensions_1.pad)(style.padding, 'top'),
            x: ((_a = scale(value)) !== null && _a !== void 0 ? _a : 0) + (isTimeScale ? 0 : scale.bandwidth() / 2),
            align: isRotated ? 'right' : isTimeScale ? 'left' : 'center',
        };
    });
}
//# sourceMappingURL=viewmodel.js.map