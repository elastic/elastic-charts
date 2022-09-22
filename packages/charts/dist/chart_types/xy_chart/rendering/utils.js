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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getY0ScaledValueFn = exports.getY1ScaledValueFn = exports.CHROME_PINCH_BUG_EPSILON = exports.isYValueDefinedFn = exports.isPointOnGeometry = exports.getGeometryStateStyle = exports.getClippedRanges = exports.isDatumFilled = exports.getYDatumValueFn = void 0;
var types_1 = require("../../../scales/types");
var common_1 = require("../../../utils/common");
var geometry_1 = require("../../../utils/geometry");
var constants_1 = require("./constants");
function getYDatumValueFn(valueName) {
    if (valueName === void 0) { valueName = 'y1'; }
    return function (datum, returnFilled) {
        var _a, _b;
        if (returnFilled === void 0) { returnFilled = true; }
        var value = datum[valueName];
        if (value !== null || !returnFilled) {
            return value;
        }
        return (_b = (_a = datum.filled) === null || _a === void 0 ? void 0 : _a[valueName]) !== null && _b !== void 0 ? _b : null;
    };
}
exports.getYDatumValueFn = getYDatumValueFn;
function isDatumFilled(_a) {
    var filled = _a.filled, initialY1 = _a.initialY1;
    return (filled === null || filled === void 0 ? void 0 : filled.x) !== undefined || (filled === null || filled === void 0 ? void 0 : filled.y1) !== undefined || initialY1 === null || initialY1 === undefined;
}
exports.isDatumFilled = isDatumFilled;
function getClippedRanges(dataset, xScale, xScaleOffset) {
    var firstNonNullX = null;
    var hasNull = false;
    var completeDatasetIsNull = dataset.every(function (datum) { return isDatumFilled(datum); });
    if (completeDatasetIsNull)
        return [[xScale.range[0], xScale.range[1]]];
    return dataset.reduce(function (acc, data) {
        var xScaled = xScale.scale(data.x);
        if (Number.isNaN(xScaled))
            return acc;
        var xValue = xScaled - xScaleOffset + xScale.bandwidth / 2;
        if (isDatumFilled(data)) {
            var endXValue = xScale.range[1] - xScale.bandwidth * (2 / 3);
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
function getGeometryStateStyle(seriesIdentifier, sharedGeometryStyle, highlightedLegendItem, individualHighlight) {
    var defaultStyles = sharedGeometryStyle.default, highlighted = sharedGeometryStyle.highlighted, unhighlighted = sharedGeometryStyle.unhighlighted;
    if (highlightedLegendItem) {
        var isPartOfHighlightedSeries = highlightedLegendItem.seriesIdentifiers.some(function (_a) {
            var key = _a.key;
            return key === seriesIdentifier.key;
        });
        return isPartOfHighlightedSeries ? highlighted : unhighlighted;
    }
    if (individualHighlight) {
        var hasHighlight = individualHighlight.hasHighlight, hasGeometryHover = individualHighlight.hasGeometryHover;
        if (!hasGeometryHover) {
            return highlighted;
        }
        return hasHighlight ? highlighted : unhighlighted;
    }
    return defaultStyles;
}
exports.getGeometryStateStyle = getGeometryStateStyle;
function isPointOnGeometry(xCoordinate, yCoordinate, indexedGeometry, buffer) {
    if (buffer === void 0) { buffer = constants_1.DEFAULT_HIGHLIGHT_PADDING; }
    var x = indexedGeometry.x, y = indexedGeometry.y, transform = indexedGeometry.transform;
    if ((0, geometry_1.isPointGeometry)(indexedGeometry)) {
        var radius = indexedGeometry.radius;
        var distance = (0, common_1.getDistance)({
            x: xCoordinate,
            y: yCoordinate,
        }, {
            x: x + transform.x,
            y: y + transform.y,
        });
        var radiusBuffer = typeof buffer === 'number' ? buffer : buffer(radius);
        if (radiusBuffer === Infinity) {
            return distance <= radius + constants_1.DEFAULT_HIGHLIGHT_PADDING;
        }
        return distance <= radius + radiusBuffer;
    }
    var width = indexedGeometry.width, height = indexedGeometry.height;
    return yCoordinate >= y && yCoordinate <= y + height && xCoordinate >= x && xCoordinate <= x + width;
}
exports.isPointOnGeometry = isPointOnGeometry;
var getScaleTypeValueValidator = function (yScale) {
    if (!(0, types_1.isLogarithmicScale)(yScale))
        return function () { return true; };
    var domainPolarity = getDomainPolarity(yScale.domain);
    return function (yValue) { return domainPolarity === Math.sign(yValue); };
};
var DEFAULT_ZERO_BASELINE = 0;
function isYValueDefinedFn(yScale, xScale) {
    var validator = getScaleTypeValueValidator(yScale);
    return function (datum, getValueAccessor) {
        var yValue = getValueAccessor(datum);
        return yValue !== null && validator(yValue) && xScale.isValueInDomain(datum.x);
    };
}
exports.isYValueDefinedFn = isYValueDefinedFn;
exports.CHROME_PINCH_BUG_EPSILON = 0.5;
function chromeRenderBugBuffer(y1, y0) {
    return Math.abs(y1 - y0) <= exports.CHROME_PINCH_BUG_EPSILON ? 0.5 : 0;
}
function getY1ScaledValueFn(yScale) {
    var datumAccessor = getYDatumValueFn();
    var scaleY0Value = getY0ScaledValueFn(yScale);
    return function (datum) {
        var y1Value = yScale.scale(datumAccessor(datum));
        var y0Value = scaleY0Value(datum);
        return y1Value - chromeRenderBugBuffer(y1Value, y0Value);
    };
}
exports.getY1ScaledValueFn = getY1ScaledValueFn;
function getY0ScaledValueFn(yScale) {
    var domainPolarity = getDomainPolarity(yScale.domain);
    var logBaseline = domainPolarity >= 0 ? Math.min.apply(Math, __spreadArray([], __read(yScale.domain), false)) : Math.max.apply(Math, __spreadArray([], __read(yScale.domain), false));
    return function (_a) {
        var y0 = _a.y0;
        return (0, types_1.isLogarithmicScale)(yScale)
            ? y0 === null || domainPolarity !== Math.sign(y0)
                ? yScale.scale(logBaseline)
                : yScale.scale(y0)
            : yScale.scale(y0 === null ? DEFAULT_ZERO_BASELINE : y0);
    };
}
exports.getY0ScaledValueFn = getY0ScaledValueFn;
function getDomainPolarity(domain) {
    return Math.sign(Math.sign(domain[0]) + Math.sign(domain[1]));
}
//# sourceMappingURL=utils.js.map