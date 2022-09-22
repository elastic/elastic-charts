"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderArea = void 0;
var d3_shape_1 = require("d3-shape");
var curves_1 = require("../../../utils/curves");
var series_1 = require("../utils/series");
var points_1 = require("./points");
var utils_1 = require("./utils");
function renderArea(shift, dataSeries, xScale, yScale, panel, color, curve, isBandedSpec, xScaleOffset, style, markSizeOptions, isStacked, hasFit, pointStyleAccessor) {
    var y1Fn = (0, utils_1.getY1ScaledValueFn)(yScale);
    var y0Fn = (0, utils_1.getY0ScaledValueFn)(yScale);
    var definedFn = (0, utils_1.isYValueDefinedFn)(yScale, xScale);
    var y1DatumAccessor = (0, utils_1.getYDatumValueFn)();
    var y0DatumAccessor = (0, utils_1.getYDatumValueFn)('y0');
    var pathGenerator = (0, d3_shape_1.area)()
        .x(function (_a) {
        var x = _a.x;
        return xScale.scale(x) - xScaleOffset;
    })
        .y1(y1Fn)
        .y0(y0Fn)
        .defined(function (datum) {
        return definedFn(datum, y1DatumAccessor) && (isBandedSpec ? definedFn(datum, y0DatumAccessor) : true);
    })
        .curve((0, curves_1.getCurveFactory)(curve));
    var clippedRanges = (0, utils_1.getClippedRanges)(dataSeries.data, xScale, xScaleOffset);
    var lines = [];
    var y0Line = isBandedSpec && pathGenerator.lineY0()(dataSeries.data);
    var y1Line = pathGenerator.lineY1()(dataSeries.data);
    if (y1Line)
        lines.push(y1Line);
    if (y0Line)
        lines.push(y0Line);
    var _a = (0, points_1.renderPoints)(shift - xScaleOffset, dataSeries, xScale, yScale, panel, color, style.point, isBandedSpec, markSizeOptions, false, pointStyleAccessor), pointGeometries = _a.pointGeometries, indexedGeometryMap = _a.indexedGeometryMap;
    var areaGeometry = {
        area: pathGenerator(dataSeries.data) || '',
        lines: lines,
        points: pointGeometries,
        color: color,
        transform: {
            y: 0,
            x: shift,
        },
        seriesIdentifier: (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries),
        style: style,
        isStacked: isStacked,
        clippedRanges: clippedRanges,
        shouldClip: hasFit,
    };
    return {
        areaGeometry: areaGeometry,
        indexedGeometryMap: indexedGeometryMap,
    };
}
exports.renderArea = renderArea;
//# sourceMappingURL=area.js.map