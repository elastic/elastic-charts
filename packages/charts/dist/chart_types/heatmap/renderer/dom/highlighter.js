"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROPS = exports.HighlighterCellsComponent = void 0;
const react_1 = __importDefault(require("react"));
const light_theme_1 = require("../../../../utils/themes/light_theme");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const HighlighterCellsComponent = ({ initialized, dragShape, chartId, canvasDimension, brushArea, brushMask, }) => {
    if (!initialized || dragShape === null)
        return null;
    return (react_1.default.createElement("svg", { className: "echHighlighter", width: "100%", height: "100%" },
        react_1.default.createElement("defs", null,
            react_1.default.createElement("mask", { id: `echHighlighterMask__${chartId}` },
                brushMask.visible && (react_1.default.createElement("rect", { x: 0, y: 0, width: canvasDimension.width + canvasDimension.left, height: canvasDimension.height, fill: "#eee" })),
                brushArea.visible && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("rect", { x: dragShape.x, y: dragShape.y, width: dragShape.width, height: dragShape.height, fill: brushArea.fill }),
                    react_1.default.createElement("rect", { x: 0, y: dragShape.y, width: canvasDimension.left, height: dragShape.height, fill: brushArea.fill }))))),
        react_1.default.createElement("g", null,
            brushMask.visible && (react_1.default.createElement("rect", { x: 0, y: 0, width: canvasDimension.width + canvasDimension.left, height: canvasDimension.height, mask: `url(#echHighlighterMask__${chartId})`, fill: brushMask.fill })),
            brushArea.visible && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("line", { x1: dragShape.x, y1: dragShape.y, x2: dragShape.x + dragShape.width, y2: dragShape.y, stroke: brushArea.stroke, strokeWidth: brushArea.strokeWidth }),
                react_1.default.createElement("line", { x1: dragShape.x, y1: dragShape.y + dragShape.height, x2: dragShape.x + dragShape.width, y2: dragShape.y + dragShape.height, stroke: brushArea.stroke, strokeWidth: brushArea.strokeWidth }),
                react_1.default.createElement("line", { x1: dragShape.x, y1: dragShape.y, x2: dragShape.x, y2: dragShape.y + dragShape.height, stroke: brushArea.stroke, strokeWidth: brushArea.strokeWidth }),
                react_1.default.createElement("line", { x1: dragShape.x + dragShape.width, y1: dragShape.y, x2: dragShape.x + dragShape.width, y2: dragShape.y + dragShape.height, stroke: brushArea.stroke, strokeWidth: brushArea.strokeWidth }))))));
};
exports.HighlighterCellsComponent = HighlighterCellsComponent;
exports.DEFAULT_PROPS = {
    chartId: 'empty',
    initialized: false,
    canvasDimension: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    geometries: (0, viewmodel_types_1.nullShapeViewModel)(),
    dragShape: { x: 0, y: 0, height: 0, width: 0 },
    brushArea: light_theme_1.LIGHT_THEME.heatmap.brushArea,
    brushMask: light_theme_1.LIGHT_THEME.heatmap.brushMask,
};
//# sourceMappingURL=highlighter.js.map