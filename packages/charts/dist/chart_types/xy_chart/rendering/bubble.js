"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderBubble = void 0;
var series_1 = require("../utils/series");
var points_1 = require("./points");
function renderBubble(shift, dataSeries, xScale, yScale, color, panel, hasY0Accessors, xScaleOffset, seriesStyle, markSizeOptions, isMixedChart, pointStyleAccessor) {
    var _a = (0, points_1.renderPoints)(shift - xScaleOffset, dataSeries, xScale, yScale, panel, color, seriesStyle.point, hasY0Accessors, markSizeOptions, !isMixedChart, pointStyleAccessor), pointGeometries = _a.pointGeometries, indexedGeometryMap = _a.indexedGeometryMap;
    var bubbleGeometry = {
        points: pointGeometries,
        color: color,
        seriesIdentifier: (0, series_1.getSeriesIdentifierFromDataSeries)(dataSeries),
        seriesPointStyle: seriesStyle.point,
    };
    return {
        bubbleGeometry: bubbleGeometry,
        indexedGeometryMap: indexedGeometryMap,
    };
}
exports.renderBubble = renderBubble;
//# sourceMappingURL=bubble.js.map