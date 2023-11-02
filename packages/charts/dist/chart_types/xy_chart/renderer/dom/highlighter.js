"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Highlighter = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const is_brushing_1 = require("../../../../state/selectors/is_brushing");
const common_1 = require("../../../../utils/common");
const geometry_1 = require("../../../../utils/geometry");
const light_theme_1 = require("../../../../utils/themes/light_theme");
const compute_chart_dimensions_1 = require("../../state/selectors/compute_chart_dimensions");
const compute_chart_transform_1 = require("../../state/selectors/compute_chart_transform");
const get_tooltip_values_highlighted_geoms_1 = require("../../state/selectors/get_tooltip_values_highlighted_geoms");
const utils_1 = require("../../state/utils/utils");
const shapes_paths_1 = require("../shapes_paths");
function getTransformForPanel(panel, rotation, { left, top }) {
    const { x, y } = (0, utils_1.computeChartTransform)(panel, rotation);
    return `translate(${left + panel.left + x}, ${top + panel.top + y}) rotate(${rotation})`;
}
function renderPath(geom, radius) {
    const [shapeFn, rotate] = shapes_paths_1.ShapeRendererFn[geom.style.shape];
    return {
        d: shapeFn(radius),
        rotate,
    };
}
class HighlighterComponent extends react_1.default.Component {
    render() {
        const { highlightedGeometries, chartDimensions, chartRotation, chartId, zIndex, isBrushing, style } = this.props;
        if (isBrushing)
            return null;
        const clipWidth = [90, -90].includes(chartRotation) ? chartDimensions.height : chartDimensions.width;
        const clipHeight = [90, -90].includes(chartRotation) ? chartDimensions.width : chartDimensions.height;
        const clipPathId = `echHighlighterClipPath__${chartId}`;
        return (react_1.default.createElement("svg", { className: "echHighlighter", style: { zIndex } },
            react_1.default.createElement("defs", null,
                react_1.default.createElement("clipPath", { id: clipPathId },
                    react_1.default.createElement("rect", { x: "0", y: "0", width: clipWidth, height: clipHeight }))),
            highlightedGeometries.map((geom, i) => {
                const { panel } = geom;
                const x = geom.x + geom.transform.x;
                const y = geom.y + geom.transform.y;
                const geomTransform = getTransformForPanel(panel, chartRotation, chartDimensions);
                if ((0, geometry_1.isPointGeometry)(geom)) {
                    const fillColor = (0, common_1.getColorFromVariant)((0, color_library_wrappers_1.RGBATupleToString)(geom.style.stroke.color), style.point.fill);
                    const strokeColor = (0, common_1.getColorFromVariant)((0, color_library_wrappers_1.RGBATupleToString)(geom.style.stroke.color), style.point.stroke);
                    const radius = Math.max(geom.radius, style.point.radius);
                    const { d, rotate } = renderPath(geom, radius);
                    return (react_1.default.createElement("g", { key: i, transform: geomTransform, clipPath: geom.value.mark !== null ? `url(#${clipPathId})` : undefined },
                        react_1.default.createElement("path", { d: d, transform: `translate(${x}, ${y}) rotate(${rotate || 0})`, fill: fillColor, stroke: strokeColor, strokeWidth: style.point.strokeWidth, opacity: style.point.opacity })));
                }
                return (react_1.default.createElement("rect", { key: i, x: x, y: y, width: geom.width, height: geom.height, transform: geomTransform, className: "echHighlighterOverlay__fill", clipPath: `url(#${clipPathId})` }));
            })));
    }
}
HighlighterComponent.displayName = 'Highlighter';
const mapStateToProps = (state) => {
    const { chartId, zIndex } = state;
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            initialized: false,
            chartId,
            zIndex,
            isBrushing: false,
            highlightedGeometries: [],
            chartTransform: {
                x: 0,
                y: 0,
                rotate: 0,
            },
            chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
            chartRotation: 0,
            style: light_theme_1.LIGHT_THEME.highlighter,
        };
    }
    return {
        initialized: true,
        chartId,
        zIndex,
        isBrushing: (0, is_brushing_1.isBrushingSelector)(state),
        highlightedGeometries: (0, get_tooltip_values_highlighted_geoms_1.getHighlightedGeomsSelector)(state),
        chartTransform: (0, compute_chart_transform_1.computeChartTransformSelector)(state),
        chartDimensions: (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(state).chartDimensions,
        chartRotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
        style: (0, get_chart_theme_1.getChartThemeSelector)(state).highlighter,
    };
};
exports.Highlighter = (0, react_redux_1.connect)(mapStateToProps)(HighlighterComponent);
//# sourceMappingURL=highlighter.js.map