"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlighterFromLegend = void 0;
const react_redux_1 = require("react-redux");
const highlighter_1 = require("./highlighter");
const get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const geometries_1 = require("../../state/selectors/geometries");
const get_highlighted_shapes_1 = require("../../state/selectors/get_highlighted_shapes");
const legendMapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return highlighter_1.DEFAULT_PROPS;
    }
    const { chartId } = state;
    const geometries = (0, get_highlighted_shapes_1.legendHoverHighlightNodes)(state);
    const geometriesFoci = (0, geometries_1.partitionDrilldownFocus)(state);
    const canvasDimension = (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state);
    const multiGeometries = (0, geometries_1.partitionMultiGeometries)(state);
    const highlightMapper = (0, highlighter_1.highlightSetMapper)(geometries, geometriesFoci);
    const highlightSets = multiGeometries.map(highlightMapper);
    return {
        chartId,
        initialized: true,
        renderAsOverlay: false,
        canvasDimension,
        highlightSets,
    };
};
exports.HighlighterFromLegend = (0, react_redux_1.connect)(legendMapStateToProps)(highlighter_1.HighlighterComponent);
//# sourceMappingURL=highlighter_legend.js.map