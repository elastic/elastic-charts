"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
var canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
var viewmodel_1 = require("../../layout/viewmodel/viewmodel");
function render(spec, elementSizes, heatmapTable, colorScale, bandsToHide, theme) {
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)(function (measureText) {
        return (0, viewmodel_1.shapeViewModel)(measureText, spec, theme, elementSizes, heatmapTable, colorScale, bandsToHide);
    });
}
exports.render = render;
//# sourceMappingURL=scenegraph.js.map