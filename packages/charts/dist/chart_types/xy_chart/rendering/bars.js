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
exports.getBarStyleOverrides = exports.renderBars = void 0;
var constants_1 = require("../../../scales/constants");
var common_1 = require("../../../utils/common");
var geometry_1 = require("../../../utils/geometry");
var indexed_geometry_map_1 = require("../utils/indexed_geometry_map");
var series_1 = require("../utils/series");
var specs_1 = require("../utils/specs");
var points_1 = require("./points");
var PADDING = 1;
var FONT_SIZE_FACTOR = 0.7;
function renderBars(measureText, orderIndex, dataSeries, xScale, yScale, panel, chartRotation, minBarHeight, color, sharedSeriesStyle, displayValueSettings, styleAccessor, stackMode) {
    var _a = sharedSeriesStyle.displayValue, fontSize = _a.fontSize, fontFamily = _a.fontFamily;
    var initialBarTuple = { barGeometries: [], indexedGeometryMap: new indexed_geometry_map_1.IndexedGeometryMap() };
    var isLogY = yScale.type === constants_1.ScaleType.Log;
    var isInvertedY = yScale.isInverted;
    return dataSeries.data.reduce(function (barTuple, datum) {
        var _a, _b, _c, _d, _e, _f;
        var xScaled = xScale.scale(datum.x);
        if (!xScale.isValueInDomain(datum.x) || Number.isNaN(xScaled)) {
            return barTuple;
        }
        var barGeometries = barTuple.barGeometries, indexedGeometryMap = barTuple.indexedGeometryMap;
        var y0 = datum.y0, y1 = datum.y1, initialY1 = datum.initialY1, filled = datum.filled;
        var rawY = isLogY && (y1 === 0 || y1 === null) ? yScale.range[0] : yScale.scale(y1);
        var y0Scaled = isLogY
            ? y0 === 0 || y0 === null
                ? yScale.range[isInvertedY ? 1 : 0]
                : yScale.scale(y0)
            : yScale.scale(y0 === null ? 0 : y0);
        var finiteHeight = y0Scaled - rawY || 0;
        var absHeight = Math.abs(finiteHeight);
        var height = absHeight === 0 ? absHeight : Math.max(minBarHeight, absHeight);
        var heightExtension = height - absHeight;
        var isUpsideDown = finiteHeight < 0;
        var finiteY = Number.isNaN(y0Scaled + rawY) ? 0 : rawY;
        var y = isUpsideDown ? finiteY - height + heightExtension : finiteY - heightExtension;
        var seriesIdentifier = (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries);
        var seriesStyle = getBarStyleOverrides(datum, seriesIdentifier, sharedSeriesStyle, styleAccessor);
        var maxPixelWidth = (0, common_1.clamp)((_a = seriesStyle.rect.widthRatio) !== null && _a !== void 0 ? _a : 1, 0, 1) * xScale.bandwidth;
        var minPixelWidth = (0, common_1.clamp)((_b = seriesStyle.rect.widthPixel) !== null && _b !== void 0 ? _b : 0, 0, maxPixelWidth);
        var width = (0, common_1.clamp)((_c = seriesStyle.rect.widthPixel) !== null && _c !== void 0 ? _c : xScale.bandwidth, minPixelWidth, maxPixelWidth);
        var x = xScaled + xScale.bandwidth * orderIndex + xScale.bandwidth / 2 - width / 2;
        var y1Value = (0, points_1.getDatumYValue)(datum, false, false, stackMode);
        var formattedDisplayValue = (_d = displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.valueFormatter) === null || _d === void 0 ? void 0 : _d.call(displayValueSettings, y1Value);
        var displayValueText = (displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.isAlternatingValueLabel) && barGeometries.length % 2 ? undefined : formattedDisplayValue;
        var _g = computeBoxWidth(displayValueText !== null && displayValueText !== void 0 ? displayValueText : '', { padding: PADDING, fontSize: fontSize, fontFamily: fontFamily, measureText: measureText, width: width }, displayValueSettings), displayValueWidth = _g.displayValueWidth, fixedFontScale = _g.fixedFontScale;
        var isHorizontalRotation = chartRotation % 180 === 0;
        var referenceWidth = Math.max(isHorizontalRotation ? displayValueWidth : fixedFontScale, 1);
        var textScalingFactor = getFinalFontScalingFactor((width * FONT_SIZE_FACTOR) / referenceWidth, fixedFontScale, fontSize);
        var overflowConstraints = new Set((_e = displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.overflowConstraints) !== null && _e !== void 0 ? _e : [
            specs_1.LabelOverflowConstraint.ChartEdges,
            specs_1.LabelOverflowConstraint.BarGeometry,
        ]);
        var bboxWidthFactor = isHorizontalRotation ? textScalingFactor : 1;
        var displayValue = displayValueText && (displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.showValueLabel)
            ? {
                fontScale: textScalingFactor,
                fontSize: fixedFontScale,
                text: displayValueText,
                width: bboxWidthFactor * displayValueWidth,
                height: textScalingFactor * fixedFontScale,
                overflowConstraints: overflowConstraints,
                isValueContainedInElement: (_f = displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.isValueContainedInElement) !== null && _f !== void 0 ? _f : false,
            }
            : undefined;
        var barGeometry = {
            displayValue: displayValue,
            x: x,
            y: y,
            transform: { x: 0, y: 0 },
            width: width,
            height: height,
            color: color,
            value: { x: datum.x, y: y1Value, mark: null, accessor: geometry_1.BandedAccessorType.Y1, datum: datum.datum },
            seriesIdentifier: seriesIdentifier,
            seriesStyle: seriesStyle,
            panel: panel,
        };
        indexedGeometryMap.set(barGeometry);
        if (y1 !== null && initialY1 !== null && (filled === null || filled === void 0 ? void 0 : filled.y1) === undefined) {
            barGeometries.push(barGeometry);
        }
        return barTuple;
    }, initialBarTuple);
}
exports.renderBars = renderBars;
function computeBoxWidth(text, _a, displayValueSettings) {
    var padding = _a.padding, fontSize = _a.fontSize, fontFamily = _a.fontFamily, measureText = _a.measureText, width = _a.width;
    var fixedFontScale = Math.max(typeof fontSize === 'number' ? fontSize : fontSize.min, 1);
    var computedDisplayValueWidth = measureText(text, { fontFamily: fontFamily, fontWeight: 'normal', fontStyle: 'normal', fontVariant: 'normal' }, fixedFontScale).width;
    if (typeof fontSize !== 'number') {
        return {
            fixedFontScale: fixedFontScale,
            displayValueWidth: computedDisplayValueWidth + padding,
        };
    }
    return {
        fixedFontScale: fixedFontScale,
        displayValueWidth: displayValueSettings && displayValueSettings.isValueContainedInElement ? width : computedDisplayValueWidth,
    };
}
function getFinalFontScalingFactor(scale, fixedFontSize, limits) {
    if (typeof limits === 'number') {
        return 1;
    }
    var finalFontSize = scale * fixedFontSize;
    if (finalFontSize > limits.max) {
        return limits.max / fixedFontSize;
    }
    if (finalFontSize < limits.min) {
        return limits.min / fixedFontSize;
    }
    return scale;
}
function getBarStyleOverrides(datum, seriesIdentifier, seriesStyle, styleAccessor) {
    var styleOverride = styleAccessor && styleAccessor(datum, seriesIdentifier);
    if (!styleOverride) {
        return seriesStyle;
    }
    if (typeof styleOverride === 'string') {
        return __assign(__assign({}, seriesStyle), { rect: __assign(__assign({}, seriesStyle.rect), { fill: styleOverride }) });
    }
    return (0, common_1.mergePartial)(seriesStyle, styleOverride);
}
exports.getBarStyleOverrides = getBarStyleOverrides;
//# sourceMappingURL=bars.js.map