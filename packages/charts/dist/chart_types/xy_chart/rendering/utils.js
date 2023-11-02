"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getY0ScaledValueFn = exports.getY1ScaledValueFn = exports.CHROME_PINCH_BUG_EPSILON = exports.isYValueDefinedFn = exports.isPointOnGeometry = exports.getGeometryStateStyle = exports.getClippedRanges = exports.isDatumFilled = exports.getYDatumValueFn = void 0;
const types_1 = require("../../../scales/types");
const common_1 = require("../../../utils/common");
const geometry_1 = require("../../../utils/geometry");
function getYDatumValueFn(valueName = 'y1') {
    return (datum, returnFilled = true) => {
        var _a, _b;
        const value = datum[valueName];
        if (value !== null || !returnFilled) {
            return value;
        }
        return (_b = (_a = datum.filled) === null || _a === void 0 ? void 0 : _a[valueName]) !== null && _b !== void 0 ? _b : null;
    };
}
exports.getYDatumValueFn = getYDatumValueFn;
function isDatumFilled({ filled, initialY1 }) {
    return (filled === null || filled === void 0 ? void 0 : filled.x) !== undefined || (filled === null || filled === void 0 ? void 0 : filled.y1) !== undefined || initialY1 === null || initialY1 === undefined;
}
exports.isDatumFilled = isDatumFilled;
function getClippedRanges(dataset, xScale, xScaleOffset) {
    let firstNonNullX = null;
    let hasNull = false;
    const completeDatasetIsNull = dataset.every((datum) => isDatumFilled(datum));
    if (completeDatasetIsNull)
        return [[xScale.range[0], xScale.range[1]]];
    return dataset.reduce((acc, data) => {
        const xScaled = xScale.scale(data.x);
        if (Number.isNaN(xScaled))
            return acc;
        const xValue = xScaled - xScaleOffset + xScale.bandwidth / 2;
        if (isDatumFilled(data)) {
            const endXValue = xScale.range[1] - xScale.bandwidth * (2 / 3);
            if (firstNonNullX !== null && xValue === endXValue) {
                acc.push([firstNonNullX, xValue]);
            }
            hasNull = true;
        }
        else {
            if (hasNull) {
                if (firstNonNullX !== null) {
                    acc.push([firstNonNullX, xValue]);
                }
                else {
                    acc.push([0, xValue]);
                }
                hasNull = false;
            }
            firstNonNullX = xValue;
        }
        return acc;
    }, []);
}
exports.getClippedRanges = getClippedRanges;
function getGeometryStateStyle(seriesIdentifier, sharedGeometryStyle, highlightedLegendItem) {
    const { default: defaultStyles, highlighted, unhighlighted } = sharedGeometryStyle;
    if (highlightedLegendItem) {
        const isPartOfHighlightedSeries = highlightedLegendItem.seriesIdentifiers.some(({ key }) => key === seriesIdentifier.key);
        return isPartOfHighlightedSeries ? highlighted : unhighlighted;
    }
    return defaultStyles;
}
exports.getGeometryStateStyle = getGeometryStateStyle;
function isPointOnGeometry(xCoordinate, yCoordinate, indexedGeometry, buffer) {
    const { x, y, transform } = indexedGeometry;
    if ((0, geometry_1.isPointGeometry)(indexedGeometry)) {
        const { radius } = indexedGeometry;
        const distance = (0, common_1.getDistance)({
            x: xCoordinate,
            y: yCoordinate,
        }, {
            x: x + transform.x,
            y: y + transform.y,
        });
        const radiusBuffer = typeof buffer === 'number' ? buffer : buffer(radius);
        return distance <= radius + radiusBuffer;
    }
    const { width, height } = indexedGeometry;
    return yCoordinate >= y && yCoordinate <= y + height && xCoordinate >= x && xCoordinate <= x + width;
}
exports.isPointOnGeometry = isPointOnGeometry;
const getScaleTypeValueValidator = (yScale) => {
    if (!(0, types_1.isLogarithmicScale)(yScale))
        return () => true;
    const domainPolarity = getDomainPolarity(yScale.domain);
    return (yValue) => domainPolarity === Math.sign(yValue);
};
const DEFAULT_ZERO_BASELINE = 0;
function isYValueDefinedFn(yScale, xScale) {
    const validator = getScaleTypeValueValidator(yScale);
    return (datum, getValueAccessor) => {
        const yValue = getValueAccessor(datum);
        return yValue !== null && validator(yValue) && xScale.isValueInDomain(datum.x);
    };
}
exports.isYValueDefinedFn = isYValueDefinedFn;
exports.CHROME_PINCH_BUG_EPSILON = 0.5;
function chromeRenderBugBuffer(y1, y0) {
    return Math.abs(y1 - y0) <= exports.CHROME_PINCH_BUG_EPSILON ? 0.5 : 0;
}
function getY1ScaledValueFn(yScale) {
    const datumAccessor = getYDatumValueFn();
    const scaleY0Value = getY0ScaledValueFn(yScale);
    return (datum) => {
        const y1Value = yScale.scale(datumAccessor(datum));
        const y0Value = scaleY0Value(datum);
        return y1Value - chromeRenderBugBuffer(y1Value, y0Value);
    };
}
exports.getY1ScaledValueFn = getY1ScaledValueFn;
function getY0ScaledValueFn(yScale) {
    const domainPolarity = getDomainPolarity(yScale.domain);
    const logBaseline = domainPolarity >= 0 ? Math.min(...yScale.domain) : Math.max(...yScale.domain);
    return ({ y0 }) => (0, types_1.isLogarithmicScale)(yScale)
        ? y0 === null || domainPolarity !== Math.sign(y0)
            ? yScale.scale(logBaseline)
            : yScale.scale(y0)
        : yScale.scale(y0 === null ? DEFAULT_ZERO_BASELINE : y0);
}
exports.getY0ScaledValueFn = getY0ScaledValueFn;
function getDomainPolarity(domain) {
    var _a, _b;
    return Math.sign(Math.sign((_a = domain[0]) !== null && _a !== void 0 ? _a : NaN) + Math.sign((_b = domain[1]) !== null && _b !== void 0 ? _b : NaN));
}
//# sourceMappingURL=utils.js.map