"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastValues = void 0;
const constants_1 = require("../../../../scales/constants");
const utils_1 = require("../../rendering/utils");
const series_1 = require("../../utils/series");
const specs_1 = require("../../utils/specs");
function getLastValues(dataSeries, xDomain) {
    if (xDomain.type === constants_1.ScaleType.Ordinal) {
        return new Map();
    }
    const lastValues = new Map();
    dataSeries.forEach((series) => {
        if (series.data.length === 0) {
            return;
        }
        const last = series.data.at(-1);
        if (!last) {
            return;
        }
        if ((0, utils_1.isDatumFilled)(last)) {
            return;
        }
        if (last.x !== xDomain.domain.at(-1)) {
            return;
        }
        const { y0, y1, initialY0, initialY1 } = last;
        const seriesKey = (0, series_1.getSeriesKey)(series, series.groupId);
        if (series.stackMode === specs_1.StackMode.Percentage) {
            const y1InPercentage = y1 === null || y0 === null ? null : y1 - y0;
            lastValues.set(seriesKey, { y0, y1: y1InPercentage });
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