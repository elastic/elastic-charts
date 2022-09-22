"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlighterFromLegend = void 0;
var react_redux_1 = require("react-redux");
var get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var geometries_1 = require("../../state/selectors/geometries");
var get_highlighted_shapes_1 = require("../../state/selectors/get_highlighted_shapes");
var highlighter_1 = require("./highlighter");
var legendMapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return highlighter_1.DEFAULT_PROPS;
    }
    var chartId = state.chartId;
    var geometries = (0, get_highlighted_shapes_1.legendHoverHighlightNodes)(state);
    var geometriesFoci = (0, geometries_1.partitionDrilldownFocus)(state);
    var canvasDimension = (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state);
    var multiGeometries = (0, geometries_1.partitionMultiGeometries)(state);
    var highlightMapper = (0, highlighter_1.highlightSetMapper)(geometries, geometriesFoci);
    var highlightSets = multiGeometries.map(highlightMapper);
    return {
        chartId: chartId,
        initialized: true,
        renderAsOverlay: false,
        canvasDimension: canvasDimension,
        highlightSets: highlightSets,
    };
};
exports.HighlighterFromLegend = (0, react_redux_1.connect)(legendMapStateToProps)(highlighter_1.HighlighterComponent);
//# sourceMappingURL=highlighter_legend.js.map