"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
var react_1 = __importDefault(require("react"));
var tooltip_1 = require("../../../../components/tooltip/tooltip");
var partition_1 = require("../canvas/partition");
var highlighter_hover_1 = require("./highlighter_hover");
var highlighter_legend_1 = require("./highlighter_legend");
function render(containerRef, forwardStageRef) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(tooltip_1.Tooltip, { getChartContainerRef: containerRef }),
        react_1.default.createElement(partition_1.Partition, { forwardStageRef: forwardStageRef }),
        react_1.default.createElement(highlighter_hover_1.HighlighterFromHover, null),
        react_1.default.createElement(highlighter_legend_1.HighlighterFromLegend, null)));
}
exports.render = render;
//# sourceMappingURL=layered_partition_chart.js.map