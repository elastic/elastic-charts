"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLine = void 0;
var d3_shape_1 = require("d3-shape");
var curves_1 = require("../../../utils/curves");
var series_1 = require("../utils/series");
var points_1 = require("./points");
var utils_1 = require("./utils");
function renderLine(shift, dataSeries, xScale, yScale, panel, color, curve, hasY0Accessors, xScaleOffset, seriesStyle, markSizeOptions, hasFit, pointStyleAccessor) {
    var y1Fn = (0, utils_1.getY1ScaledValueFn)(yScale);
    var definedFn = (0, utils_1.isYValueDefinedFn)(yScale, xScale);
    var y1Accessor = (0, utils_1.getYDatumValueFn)();
    var pathGenerator = (0, d3_shape_1.line)()
        .x(function (_a) {
        var x = _a.x;
        return xScale.scale(x) - xScaleOffset;
    })
        .y(y1Fn)
        .defined(function (datum) { return definedFn(datum, y1Accessor); })
        .curve((0, curves_1.getCurveFactory)(curve));
    var _a = (0, points_1.renderPoints)(shift - xScaleOffset, dataSeries, xScale, yScale, panel, color, seriesStyle.point, hasY0Accessors, markSizeOptions, false, pointStyleAccessor), pointGeometries = _a.pointGeometries, indexedGeometryMap = _a.indexedGeometryMap;
    var clippedRanges = (0, utils_1.getClippedRanges)(dataSeries.data, xScale, xScaleOffset);
    var lineGeometry = {
        line: pathGenerator(dataSeries.data) || '',
        points: pointGeometries,
        color: color,
        transform: {
            x: shift,
            y: 0,
        },
        seriesIdentifier: (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries),
        style: seriesStyle,
        clippedRanges: clippedRanges,
        shouldClip: hasFit,
    };
    return {
        lineGeometry: lineGeometry,
        indexedGeometryMap: indexedGeometryMap,
    };
}
exports.renderLine = renderLine;
//# sourceMappingURL=line.js.map