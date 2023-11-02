"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRadiusFn = exports.getDatumYValue = exports.getPointStyleOverrides = exports.renderPoints = void 0;
const point_style_1 = require("./point_style");
const utils_1 = require("./utils");
const common_1 = require("../../../utils/common");
const geometry_1 = require("../../../utils/geometry");
const indexed_geometry_map_1 = require("../utils/indexed_geometry_map");
const series_1 = require("../utils/series");
const specs_1 = require("../utils/specs");
function renderPoints(shift, dataSeries, xScale, yScale, panel, color, pointStyle, isolatedPointThemeStyle, isBandChart, markSizeOptions, useSpatialIndex, allowIsolated, styleAccessor) {
    const indexedGeometryMap = new indexed_geometry_map_1.IndexedGeometryMap();
    const getRadius = markSizeOptions.enabled
        ? getRadiusFn(dataSeries.data, pointStyle.strokeWidth, markSizeOptions.ratio)
        : () => 0;
    const geometryType = useSpatialIndex ? indexed_geometry_map_1.GeometryType.spatial : indexed_geometry_map_1.GeometryType.linear;
    const y1Fn = (0, utils_1.getY1ScaledValueFn)(yScale);
    const y0Fn = (0, utils_1.getY0ScaledValueFn)(yScale);
    const yDefined = (0, utils_1.isYValueDefinedFn)(yScale, xScale);
    const pointGeometries = dataSeries.data.reduce((acc, datum, dataIndex) => {
        const { x: xValue, mark } = datum;
        const prev = dataSeries.data[dataIndex - 1];
        const next = dataSeries.data[dataIndex + 1];
        if (!xScale.isValueInDomain(xValue))
            return acc;
        const x = xScale.scale(xValue);
        if (Number.isNaN(x))
            return acc;
        const points = [];
        const yDatumKeyNames = isBandChart ? ['y0', 'y1'] : ['y1'];
        yDatumKeyNames.forEach((yDatumKeyName, keyIndex) => {
            var _a;
            const valueAccessor = (0, utils_1.getYDatumValueFn)(yDatumKeyName);
            const y = yDatumKeyName === 'y1' ? y1Fn(datum) : y0Fn(datum);
            const originalY = getDatumYValue(datum, keyIndex === 0, isBandChart, dataSeries.stackMode);
            const seriesIdentifier = (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries);
            const styleOverrides = getPointStyleOverrides(datum, seriesIdentifier, styleAccessor);
            const style = (0, point_style_1.buildPointGeometryStyles)(color, pointStyle, styleOverrides);
            const isPointIsolated = allowIsolated && isIsolatedPoint(dataIndex, dataSeries.data.length, yDefined, prev, next);
            const isolatedPointStyle = (0, point_style_1.buildPointGeometryStyles)(color, isolatedPointThemeStyle);
            const radius = isPointIsolated
                ? isolatedPointThemeStyle.radius
                : markSizeOptions.enabled
                    ? Math.max(getRadius(mark), pointStyle.radius)
                    : (_a = styleOverrides === null || styleOverrides === void 0 ? void 0 : styleOverrides.radius) !== null && _a !== void 0 ? _a : pointStyle.radius;
            const pointGeometry = {
                x,
                y: y === null ? NaN : y,
                radius,
                color,
                style: isolatedPointThemeStyle.visible && isPointIsolated ? isolatedPointStyle : style,
                value: {
                    x: xValue,
                    y: originalY,
                    mark,
                    accessor: isBandChart && keyIndex === 0 ? geometry_1.BandedAccessorType.Y0 : geometry_1.BandedAccessorType.Y1,
                    datum: datum.datum,
                },
                transform: {
                    x: shift,
                    y: 0,
                },
                seriesIdentifier,
                panel,
                isolated: isPointIsolated,
            };
            indexedGeometryMap.set(pointGeometry, geometryType);
            if ((0, common_1.isFiniteNumber)(y) &&
                yDefined(datum, valueAccessor) &&
                yScale.isValueInDomain(valueAccessor(datum)) &&
                !(0, utils_1.isDatumFilled)(datum)) {
                points.push(pointGeometry);
            }
        });
        return [...acc, ...points];
    }, []);
    return {
        pointGeometries,
        indexedGeometryMap,
    };
}
exports.renderPoints = renderPoints;
function getPointStyleOverrides(datum, seriesIdentifier, pointStyleAccessor) {
    const styleOverride = pointStyleAccessor && pointStyleAccessor(datum, seriesIdentifier);
    if (!styleOverride) {
        return;
    }
    if (typeof styleOverride === 'string') {
        return {
            stroke: styleOverride,
        };
    }
    return styleOverride;
}
exports.getPointStyleOverrides = getPointStyleOverrides;
function getDatumYValue({ y1, y0, initialY1, initialY0 }, lookingForY0, isBandChart, stackMode) {
    if (isBandChart) {
        return stackMode === specs_1.StackMode.Percentage ? (lookingForY0 ? y0 : y1) : lookingForY0 ? initialY0 : initialY1;
    }
    return stackMode === specs_1.StackMode.Percentage ? ((0, common_1.isNil)(y1) || (0, common_1.isNil)(initialY1) ? null : y1 - (y0 !== null && y0 !== void 0 ? y0 : 0)) : initialY1;
}
exports.getDatumYValue = getDatumYValue;
function getRadiusFn(data, lineWidth, markSizeRatio = 50) {
    if (data.length === 0) {
        return () => 0;
    }
    const { min, max } = data.reduce((acc, { mark }) => mark === null
        ? acc
        : {
            min: Math.min(acc.min, mark / 2),
            max: Math.max(acc.max, mark / 2),
        }, { min: Infinity, max: -Infinity });
    const adjustedMarkSizeRatio = Math.min(Math.max(markSizeRatio, 0), 100);
    const radiusStep = (max - min || max * 100) / Math.pow(adjustedMarkSizeRatio, 2);
    return function getRadius(mark, defaultRadius = 0) {
        if (mark === null) {
            return defaultRadius;
        }
        const circleRadius = (mark / 2 - min) / radiusStep;
        const baseMagicNumber = 2;
        return circleRadius ? Math.sqrt(circleRadius + baseMagicNumber) + lineWidth : lineWidth;
    };
}
exports.getRadiusFn = getRadiusFn;
function yAccessorForIsolatedPointCheck(datum) {
    var _a;
    return ((_a = datum.filled) === null || _a === void 0 ? void 0 : _a.y1) ? null : datum.y1;
}
function isIsolatedPoint(index, length, yDefined, prev, next) {
    if (index === 0 && ((0, common_1.isNil)(next) || !yDefined(next, yAccessorForIsolatedPointCheck))) {
        return true;
    }
    if (index === length - 1 && ((0, common_1.isNil)(prev) || !yDefined(prev, yAccessorForIsolatedPointCheck))) {
        return true;
    }
    return (((0, common_1.isNil)(prev) || !yDefined(prev, yAccessorForIsolatedPointCheck)) &&
        ((0, common_1.isNil)(next) || !yDefined(next, yAccessorForIsolatedPointCheck)));
}
//# sourceMappingURL=points.js.map