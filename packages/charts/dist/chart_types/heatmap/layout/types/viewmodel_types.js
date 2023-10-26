"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullShapeViewModel = exports.isPickedCells = void 0;
const __1 = require("../../..");
const light_theme_1 = require("../../../../utils/themes/light_theme");
function isPickedCells(v) {
    return Array.isArray(v);
}
exports.isPickedCells = isPickedCells;
const nullShapeViewModel = () => ({
    theme: light_theme_1.LIGHT_THEME.heatmap,
    heatmapViewModels: [],
    pickQuads: () => [],
    pickDragArea: () => ({ cells: [], x: [], y: [], chartType: __1.ChartType.Heatmap }),
    pickDragShape: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    pickHighlightedArea: () => ({ x: 0, y: 0, width: 0, height: 0 }),
    pickGridCell: () => undefined,
    pickCursorBand: () => undefined,
});
exports.nullShapeViewModel = nullShapeViewModel;
//# sourceMappingURL=viewmodel_types.js.map