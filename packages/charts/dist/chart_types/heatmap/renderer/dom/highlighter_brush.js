"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlighterFromBrush = void 0;
const react_redux_1 = require("react-redux");
const highlighter_1 = require("./highlighter");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const compute_chart_dimensions_1 = require("../../state/selectors/compute_chart_dimensions");
const get_brushed_highlighted_shapes_1 = require("../../state/selectors/get_brushed_highlighted_shapes");
const get_highlighted_area_1 = require("../../state/selectors/get_highlighted_area");
const get_per_panel_heatmap_geometries_1 = require("../../state/selectors/get_per_panel_heatmap_geometries");
const brushMapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return highlighter_1.DEFAULT_PROPS;
    }
    let dragShape = (0, get_brushed_highlighted_shapes_1.getBrushedHighlightedShapesSelector)(state);
    const highlightedArea = (0, get_highlighted_area_1.getHighlightedAreaSelector)(state);
    if (highlightedArea) {
        dragShape = highlightedArea;
    }
    const { chartId } = state;
    const geoms = (0, get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries)(state);
    const canvasDimension = (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(state).chartDimensions;
    const { brushMask, brushArea } = (0, get_chart_theme_1.getChartThemeSelector)(state).heatmap;
    return {
        chartId,
        initialized: true,
        canvasDimension,
        geometries: geoms,
        dragShape,
        brushMask,
        brushArea,
    };
};
exports.HighlighterFromBrush = (0, react_redux_1.connect)(brushMapStateToProps)(highlighter_1.HighlighterCellsComponent);
//# sourceMappingURL=highlighter_brush.js.map