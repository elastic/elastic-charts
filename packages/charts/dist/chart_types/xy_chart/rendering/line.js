"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLine = void 0;
const d3_shape_1 = require("d3-shape");
const points_1 = require("./points");
const utils_1 = require("./utils");
const curves_1 = require("../../../utils/curves");
const series_1 = require("../utils/series");
function renderLine(shift, dataSeries, xScale, yScale, panel, color, curve, hasY0Accessors, xScaleOffset, seriesStyle, markSizeOptions, hasFit, pointStyleAccessor) {
    const y1Fn = (0, utils_1.getY1ScaledValueFn)(yScale);
    const definedFn = (0, utils_1.isYValueDefinedFn)(yScale, xScale);
    const y1Accessor = (0, utils_1.getYDatumValueFn)();
    const pathGenerator = (0, d3_shape_1.line)()
        .x(({ x }) => xScale.scale(x) - xScaleOffset)
        .y(y1Fn)
        .defined((datum) => definedFn(datum, y1Accessor))
        .curve((0, curves_1.getCurveFactory)(curve));
    const { pointGeometries, indexedGeometryMap } = (0, points_1.renderPoints)(shift - xScaleOffset, dataSeries, xScale, yScale, panel, color, seriesStyle.point, seriesStyle.isolatedPoint, hasY0Accessors, markSizeOptions, false, true, pointStyleAccessor);
    const clippedRanges = (0, utils_1.getClippedRanges)(dataSeries.data, xScale, xScaleOffset);
    const lineGeometry = {
        line: pathGenerator(dataSeries.data) || '',
        points: pointGeometries,
        color,
        transform: {
            x: shift,
            y: 0,
        },
        seriesIdentifier: (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries),
        style: seriesStyle,
        clippedRanges,
        shouldClip: hasFit,
    };
    return {
        lineGeometry,
        indexedGeometryMap,
    };
}
exports.renderLine = renderLine;
//# sourceMappingURL=line.js.map