"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullShapeViewModel = exports.nullHeatmapViewModel = exports.isPickedCells = void 0;
var __1 = require("../../..");
var colors_1 = require("../../../../common/colors");
var light_theme_1 = require("../../../../utils/themes/light_theme");
function isPickedCells(v) {
    return Array.isArray(v);
}
exports.isPickedCells = isPickedCells;
exports.nullHeatmapViewModel = {
    gridOrigin: {
        x: 0,
        y: 0,
    },
    gridLines: {
        x: [],
        y: [],
        stroke: { width: 0, color: colors_1.Colors.Transparent.rgba },
    },
    cells: [],
    xValues: [],
    yValues: [],
    pageSize: 0,
    cellFontSize: function () { return 0; },
    titles: [],
};
var nullShapeViewModel = function () { return ({
    theme: light_theme_1.LIGHT_THEME.heatmap,
    heatmapViewModel: exports.nullHeatmapViewModel,
    pickQuads: function () { return []; },
    pickDragArea: function () { return ({ cells: [], x: [], y: [], chartType: __1.ChartType.Heatmap }); },
    pickDragShape: function () { return ({ x: 0, y: 0, width: 0, height: 0 }); },
    pickHighlightedArea: function () { return ({ x: 0, y: 0, width: 0, height: 0 }); },
    pickGridCell: function () { return undefined; },
    pickCursorBand: function () { return undefined; },
}); };
exports.nullShapeViewModel = nullShapeViewModel;
//# sourceMappingURL=viewmodel_types.js.map