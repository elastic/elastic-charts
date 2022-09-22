"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastValues = void 0;
var utils_1 = require("../../rendering/utils");
var series_1 = require("../../utils/series");
var specs_1 = require("../../utils/specs");
function getLastValues(dataSeries, xDomain) {
    var lastValues = new Map();
    dataSeries.forEach(function (series) {
        if (series.data.length === 0) {
            return;
        }
        var last = series.data[series.data.length - 1];
        if (!last) {
            return;
        }
        if ((0, utils_1.isDatumFilled)(last)) {
            return;
        }
        if (last.x !== xDomain.domain[xDomain.domain.length - 1]) {
            return;
        }
        var y0 = last.y0, y1 = last.y1, initialY0 = last.initialY0, initialY1 = last.initialY1;
        var seriesKey = (0, series_1.getSeriesKey)(series, series.groupId);
        if (series.stackMode === specs_1.StackMode.Percentage) {
            var y1InPercentage = y1 === null || y0 === null ? null : y1 - y0;
            lastValues.set(seriesKey, { y0: y0, y1: y1InPercentage });
            return;
        }
        if (initialY0 !== null || initialY1 !== null) {
            lastValues.set(seriesKey, { y0: initialY0, y1: initialY1 });
        }
    });
    return lastValues;
}
exports.getLastValues = getLastValues;
//# sourceMappingURL=get_last_value.js.map