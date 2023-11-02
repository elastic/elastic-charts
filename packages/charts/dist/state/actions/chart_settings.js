"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChartTitles = exports.updateParentDimensions = exports.UPDATE_CHART_TITLES = exports.UPDATE_PARENT_DIMENSION = void 0;
exports.UPDATE_PARENT_DIMENSION = 'UPDATE_PARENT_DIMENSION';
exports.UPDATE_CHART_TITLES = 'UPDATE_CHART_TITLES';
function updateParentDimensions(dimensions) {
    return { type: exports.UPDATE_PARENT_DIMENSION, dimensions };
}
exports.updateParentDimensions = updateParentDimensions;
function updateChartTitles(title, description) {
    return { type: exports.UPDATE_CHART_TITLES, title, description };
}
exports.updateChartTitles = updateChartTitles;
//# sourceMappingURL=chart_settings.js.map