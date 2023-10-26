"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlighterFromHover = void 0;
const react_redux_1 = require("react-redux");
const highlighter_1 = require("./highlighter");
const get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const geometries_1 = require("../../state/selectors/geometries");
const picked_shapes_1 = require("../../state/selectors/picked_shapes");
const hoverMapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return highlighter_1.DEFAULT_PROPS;
    }
    const canvasDimension = (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state);
    const { chartId } = state;
    const allGeometries = (0, geometries_1.partitionMultiGeometries)(state);
    const geometriesFoci = (0, geometries_1.partitionDrilldownFocus)(state);
    const pickedGeometries = (0, picked_shapes_1.getPickedShapes)(state);
    const highlightSets = allGeometries.map((0, highlighter_1.highlightSetMapper)(pickedGeometries, geometriesFoci));
    return {
        chartId,
        initialized: true,
        renderAsOverlay: true,
        canvasDimension,
        highlightSets,
    };
};
exports.HighlighterFromHover = (0, react_redux_1.connect)(hoverMapStateToProps)(highlighter_1.HighlighterComponent);
//# sourceMappingURL=highlighter_hover.js.map