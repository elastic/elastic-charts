"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlighterFromBrush = void 0;
var react_redux_1 = require("react-redux");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var compute_chart_dimensions_1 = require("../../state/selectors/compute_chart_dimensions");
var geometries_1 = require("../../state/selectors/geometries");
var get_brushed_highlighted_shapes_1 = require("../../state/selectors/get_brushed_highlighted_shapes");
var get_highlighted_area_1 = require("../../state/selectors/get_highlighted_area");
var highlighter_1 = require("./highlighter");
var brushMapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return highlighter_1.DEFAULT_PROPS;
    }
    var chartId = state.chartId;
    var geoms = (0, geometries_1.getHeatmapGeometries)(state);
    var canvasDimension = (0, compute_chart_dimensions_1.computeChartElementSizesSelector)(state).grid;
    var dragShape = (0, get_brushed_highlighted_shapes_1.getBrushedHighlightedShapesSelector)(state);
    var highlightedArea = (0, get_highlighted_area_1.getHighlightedAreaSelector)(state);
    if (highlightedArea) {
        dragShape = highlightedArea;
    }
    var _a = (0, get_chart_theme_1.getChartThemeSelector)(state).heatmap, brushMask = _a.brushMask, brushArea = _a.brushArea;
    return {
        chartId: chartId,
        initialized: true,
        canvasDimension: canvasDimension,
        geometries: geoms,
        dragShape: dragShape,
        brushMask: brushMask,
        brushArea: brushArea,
    };
};
exports.HighlighterFromBrush = (0, react_redux_1.connect)(brushMapStateToProps)(highlighter_1.HighlighterCellsComponent);
//# sourceMappingURL=highlighter_brush.js.map