"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBarStyleOverrides = exports.renderBars = void 0;
const points_1 = require("./points");
const constants_1 = require("../../../scales/constants");
const common_1 = require("../../../utils/common");
const geometry_1 = require("../../../utils/geometry");
const indexed_geometry_map_1 = require("../utils/indexed_geometry_map");
const series_1 = require("../utils/series");
const specs_1 = require("../utils/specs");
const PADDING = 1;
const FONT_SIZE_FACTOR = 0.7;
function renderBars(measureText, orderIndex, dataSeries, xScale, yScale, panel, chartRotation, minBarHeight, color, sharedSeriesStyle, displayValueSettings, styleAccessor, stackMode) {
    const { fontSize, fontFamily } = sharedSeriesStyle.displayValue;
    const initialBarTuple = { barGeometries: [], indexedGeometryMap: new indexed_geometry_map_1.IndexedGeometryMap() };
    const isLogY = yScale.type === constants_1.ScaleType.Log;
    const isInvertedY = yScale.isInverted;
    return dataSeries.data.reduce((barTuple, datum) => {
        var _a, _b, _c, _d, _e;
        const xScaled = xScale.scale(datum.x);
        if (!xScale.isValueInDomain(datum.x) || Number.isNaN(xScaled)) {
            return barTuple;
        }
        const { barGeometries, indexedGeometryMap } = barTuple;
        const { y0, y1, initialY1, filled } = datum;
        const rawY = isLogY && (y1 === 0 || y1 === null) ? yScale.range[0] : yScale.scale(y1);
        const y0Scaled = isLogY
            ? y0 === 0 || y0 === null
                ? yScale.range[isInvertedY ? 1 : 0]
                : yScale.scale(y0)
            : yScale.scale(y0 === null ? 0 : y0);
        const finiteHeight = y0Scaled - rawY || 0;
        const absHeight = Math.abs(finiteHeight);
        const height = absHeight === 0 ? absHeight : Math.max(minBarHeight, absHeight);
        const heightExtension = height - absHeight;
        const isUpsideDown = finiteHeight < 0;
        const finiteY = Number.isNaN(y0Scaled + rawY) ? 0 : rawY;
        const y = isUpsideDown ? finiteY - height + heightExtension : finiteY - heightExtension;
        const seriesIdentifier = (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries);
        const seriesStyle = getBarStyleOverrides(datum, seriesIdentifier, sharedSeriesStyle, styleAccessor);
        const maxPixelWidth = (0, common_1.clamp)((_a = seriesStyle.rect.widthRatio) !== null && _a !== void 0 ? _a : 1, 0, 1) * xScale.bandwidth;
        const minPixelWidth = (0, common_1.clamp)((_b = seriesStyle.rect.widthPixel) !== null && _b !== void 0 ? _b : 0, 0, maxPixelWidth);
        const width = (0, common_1.clamp)((_c = seriesStyle.rect.widthPixel) !== null && _c !== void 0 ? _c : xScale.bandwidth, minPixelWidth, maxPixelWidth);
        const x = xScaled + xScale.bandwidth * orderIndex + xScale.bandwidth / 2 - width / 2;
        const y1Value = (0, points_1.getDatumYValue)(datum, false, false, stackMode);
        const formattedDisplayValue = (_d = displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.valueFormatter) === null || _d === void 0 ? void 0 : _d.call(displayValueSettings, y1Value);
        const displayValueText = (displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.isAlternatingValueLabel) && barGeometries.length % 2 ? undefined : formattedDisplayValue;
        const { displayValueWidth, fixedFontScale } = computeBoxWidth(displayValueText !== null && displayValueText !== void 0 ? displayValueText : '', {
            padding: PADDING,
            fontSize,
            fontFamily,
            measureText,
        });
        const isHorizontalRotation = chartRotation % 180 === 0;
        const referenceWidth = Math.max(isHorizontalRotation ? displayValueWidth : fixedFontScale, 1);
        const textScalingFactor = getFinalFontScalingFactor((width * FONT_SIZE_FACTOR) / referenceWidth, fixedFontScale, fontSize);
        const overflowConstraints = new Set((_e = displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.overflowConstraints) !== null && _e !== void 0 ? _e : [
            specs_1.LabelOverflowConstraint.ChartEdges,
            specs_1.LabelOverflowConstraint.BarGeometry,
        ]);
        const bboxWidthFactor = isHorizontalRotation ? textScalingFactor : 1;
        const displayValue = displayValueText && (displayValueSettings === null || displayValueSettings === void 0 ? void 0 : displayValueSettings.showValueLabel)
            ? {
                fontScale: textScalingFactor,
                fontSize: fixedFontScale,
                text: displayValueText,
                width: bboxWidthFactor * displayValueWidth,
                height: textScalingFactor * fixedFontScale,
                overflowConstraints,
            }
            : undefined;
        const barGeometry = {
            displayValue,
            x,
            y,
            transform: { x: 0, y: 0 },
            width,
            height,
            color,
            value: { x: datum.x, y: y1Value, mark: null, accessor: geometry_1.BandedAccessorType.Y1, datum: datum.datum },
            seriesIdentifier,
            seriesStyle,
            panel,
        };
        indexedGeometryMap.set(barGeometry);
        if (y1 !== null && initialY1 !== null && (filled === null || filled === void 0 ? void 0 : filled.y1) === undefined) {
            barGeometries.push(barGeometry);
        }
        return barTuple;
    }, initialBarTuple);
}
exports.renderBars = renderBars;
function computeBoxWidth(text, { padding, fontSize, fontFamily, measureText, }) {
    const fixedFontScale = Math.max(typeof fontSize === 'number' ? fontSize : fontSize.min, 1);
    const computedDisplayValueWidth = measureText(text, { fontFamily, fontWeight: 'normal', fontStyle: 'normal', fontVariant: 'normal' }, fixedFontScale).width;
    if (typeof fontSize !== 'number') {
        return {
            fixedFontScale,
            displayValueWidth: computedDisplayValueWidth + padding,
        };
    }
    return {
        fixedFontScale,
        displayValueWidth: computedDisplayValueWidth,
    };
}
function getFinalFontScalingFactor(scale, fixedFontSize, limits) {
    if (typeof limits === 'number') {
        return 1;
    }
    const finalFontSize = scale * fixedFontSize;
    if (finalFontSize > limits.max) {
        return limits.max / fixedFontSize;
    }
    if (finalFontSize < limits.min) {
        return limits.min / fixedFontSize;
    }
    return scale;
}
function getBarStyleOverrides(datum, seriesIdentifier, seriesStyle, styleAccessor) {
    const styleOverride = styleAccessor && styleAccessor(datum, seriesIdentifier);
    if (!styleOverride) {
        return seriesStyle;
    }
    if (typeof styleOverride === 'string') {
        return { ...seriesStyle, rect: { ...seriesStyle.rect, fill: styleOverride } };
    }
    return (0, common_1.mergePartial)(seriesStyle, styleOverride);
}
exports.getBarStyleOverrides = getBarStyleOverrides;
//# sourceMappingURL=bars.js.map