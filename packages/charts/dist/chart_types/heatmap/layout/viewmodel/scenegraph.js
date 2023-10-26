"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeScenegraph = void 0;
const canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
function computeScenegraph(spec, chartDimensions, elementSizes, smScales, groupBySpec, heatmapTable, colorScale, bandsToHide, theme) {
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)((measureText) => {
        return (0, viewmodel_1.shapeViewModel)(measureText, spec, theme, chartDimensions, elementSizes, heatmapTable, colorScale, smScales, groupBySpec, bandsToHide);
    });
}
exports.computeScenegraph = computeScenegraph;
//# sourceMappingURL=scenegraph.js.map