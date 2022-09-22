"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlighterFromHover = void 0;
var react_redux_1 = require("react-redux");
var get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var geometries_1 = require("../../state/selectors/geometries");
var picked_shapes_1 = require("../../state/selectors/picked_shapes");
var highlighter_1 = require("./highlighter");
var hoverMapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return highlighter_1.DEFAULT_PROPS;
    }
    var canvasDimension = (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state);
    var chartId = state.chartId;
    var allGeometries = (0, geometries_1.partitionMultiGeometries)(state);
    var geometriesFoci = (0, geometries_1.partitionDrilldownFocus)(state);
    var pickedGeometries = (0, picked_shapes_1.getPickedShapes)(state);
    var highlightSets = allGeometries.map((0, highlighter_1.highlightSetMapper)(pickedGeometries, geometriesFoci));
    return {
        chartId: chartId,
        initialized: true,
        renderAsOverlay: true,
        canvasDimension: canvasDimension,
        highlightSets: highlightSets,
    };
};
exports.HighlighterFromHover = (0, react_redux_1.connect)(hoverMapStateToProps)(highlighter_1.HighlighterComponent);
//# sourceMappingURL=highlighter_hover.js.map