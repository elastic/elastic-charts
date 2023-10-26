"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBubble = void 0;
const points_1 = require("./points");
const series_1 = require("../utils/series");
function renderBubble(shift, dataSeries, xScale, yScale, color, panel, hasY0Accessors, xScaleOffset, seriesStyle, markSizeOptions, isMixedChart, pointStyleAccessor) {
    const { pointGeometries, indexedGeometryMap } = (0, points_1.renderPoints)(shift - xScaleOffset, dataSeries, xScale, yScale, panel, color, seriesStyle.point, { ...seriesStyle.point, visible: false }, hasY0Accessors, markSizeOptions, !isMixedChart, false, pointStyleAccessor);
    const bubbleGeometry = {
        points: pointGeometries,
        color,
        seriesIdentifier: (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries),
        seriesPointStyle: seriesStyle.point,
    };
    return {
        bubbleGeometry,
        indexedGeometryMap,
    };
}
exports.renderBubble = renderBubble;
//# sourceMappingURL=bubble.js.map