"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstTickValueSelector = exports.getGoalChartSemanticDataSelector = exports.getGoalChartLabelsSelector = exports.getGoalChartDataSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var geometries_1 = require("./geometries");
exports.getGoalChartDataSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.geometries], function (geoms) {
    var goalChartData = {
        maximum: geoms.bulletViewModel.highestValue,
        minimum: geoms.bulletViewModel.lowestValue,
        target: geoms.bulletViewModel.target,
        value: geoms.bulletViewModel.actual,
    };
    return goalChartData;
});
exports.getGoalChartLabelsSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.geometries], function (geoms) {
    return { majorLabel: geoms.bulletViewModel.labelMajor, minorLabel: geoms.bulletViewModel.labelMinor };
});
exports.getGoalChartSemanticDataSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.geometries], function (geoms) {
    var _a;
    return (_a = geoms.bulletViewModel.bands) !== null && _a !== void 0 ? _a : [];
});
exports.getFirstTickValueSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.geometries], function (geoms) {
    return geoms.bulletViewModel.lowestValue;
});
//# sourceMappingURL=get_goal_chart_data.js.map