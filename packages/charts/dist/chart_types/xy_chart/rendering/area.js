"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderArea = void 0;
const d3_shape_1 = require("d3-shape");
const points_1 = require("./points");
const utils_1 = require("./utils");
const curves_1 = require("../../../utils/curves");
const series_1 = require("../utils/series");
function renderArea(shift, dataSeries, xScale, yScale, panel, color, curve, isBandedSpec, xScaleOffset, style, markSizeOptions, isStacked, hasFit, pointStyleAccessor) {
    const y1Fn = (0, utils_1.getY1ScaledValueFn)(yScale);
    const y0Fn = (0, utils_1.getY0ScaledValueFn)(yScale);
    const definedFn = (0, utils_1.isYValueDefinedFn)(yScale, xScale);
    const y1DatumAccessor = (0, utils_1.getYDatumValueFn)();
    const y0DatumAccessor = (0, utils_1.getYDatumValueFn)('y0');
    const pathGenerator = (0, d3_shape_1.area)()
        .x(({ x }) => xScale.scale(x) - xScaleOffset)
        .y1(y1Fn)
        .y0(y0Fn)
        .defined((datum) => {
        return definedFn(datum, y1DatumAccessor) && (isBandedSpec ? definedFn(datum, y0DatumAccessor) : true);
    })
        .curve((0, curves_1.getCurveFactory)(curve));
    const clippedRanges = (0, utils_1.getClippedRanges)(dataSeries.data, xScale, xScaleOffset);
    const lines = [];
    const y0Line = isBandedSpec && pathGenerator.lineY0()(dataSeries.data);
    const y1Line = pathGenerator.lineY1()(dataSeries.data);
    if (y1Line)
        lines.push(y1Line);
    if (y0Line)
        lines.push(y0Line);
    const { pointGeometries, indexedGeometryMap } = (0, points_1.renderPoints)(shift - xScaleOffset, dataSeries, xScale, yScale, panel, color, style.point, style.isolatedPoint, isBandedSpec, markSizeOptions, false, true, pointStyleAccessor);
    const areaGeometry = {
        area: pathGenerator(dataSeries.data) || '',
        lines,
        points: pointGeometries,
        color,
        transform: {
            y: 0,
            x: shift,
        },
        seriesIdentifier: (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries),
        style,
        isStacked,
        clippedRanges,
        shouldClip: hasFit,
    };
    return {
        areaGeometry,
        indexedGeometryMap,
    };
}
exports.renderArea = renderArea;
//# sourceMappingURL=area.js.map