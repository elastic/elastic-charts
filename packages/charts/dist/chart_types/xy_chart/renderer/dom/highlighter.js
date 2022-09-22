"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Highlighter = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var geometry_1 = require("../../../../utils/geometry");
var constants_1 = require("../../rendering/constants");
var compute_chart_dimensions_1 = require("../../state/selectors/compute_chart_dimensions");
var compute_chart_transform_1 = require("../../state/selectors/compute_chart_transform");
var get_tooltip_values_highlighted_geoms_1 = require("../../state/selectors/get_tooltip_values_highlighted_geoms");
var utils_1 = require("../../state/utils/utils");
var shapes_paths_1 = require("../shapes_paths");
function getTransformForPanel(panel, rotation, _a) {
    var left = _a.left, top = _a.top;
    var _b = (0, utils_1.computeChartTransform)(panel, rotation), x = _b.x, y = _b.y;
    return "translate(".concat(left + panel.left + x, ", ").concat(top + panel.top + y, ") rotate(").concat(rotation, ")");
}
function renderPath(geom) {
    var radius = Math.max(geom.radius, constants_1.DEFAULT_HIGHLIGHT_PADDING);
    var _a = __read(shapes_paths_1.ShapeRendererFn[geom.style.shape], 2), shapeFn = _a[0], rotate = _a[1];
    return {
        d: shapeFn(radius),
        rotate: rotate,
    };
}
var HighlighterComponent = (function (_super) {
    __extends(HighlighterComponent, _super);
    function HighlighterComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HighlighterComponent.prototype.render = function () {
        var _a = this.props, highlightedGeometries = _a.highlightedGeometries, chartDimensions = _a.chartDimensions, chartRotation = _a.chartRotation, chartId = _a.chartId, zIndex = _a.zIndex;
        var clipWidth = [90, -90].includes(chartRotation) ? chartDimensions.height : chartDimensions.width;
        var clipHeight = [90, -90].includes(chartRotation) ? chartDimensions.width : chartDimensions.height;
        var clipPathId = "echHighlighterClipPath__".concat(chartId);
        return (react_1.default.createElement("svg", { className: "echHighlighter", style: { zIndex: zIndex } },
            react_1.default.createElement("defs", null,
                react_1.default.createElement("clipPath", { id: clipPathId },
                    react_1.default.createElement("rect", { x: "0", y: "0", width: clipWidth, height: clipHeight }))),
            highlightedGeometries.map(function (geom, i) {
                var panel = geom.panel;
                var x = geom.x + geom.transform.x;
                var y = geom.y + geom.transform.y;
                var geomTransform = getTransformForPanel(panel, chartRotation, chartDimensions);
                if ((0, geometry_1.isPointGeometry)(geom)) {
                    var color = geom.style.stroke.color;
                    var _a = renderPath(geom), d = _a.d, rotate = _a.rotate;
                    return (react_1.default.createElement("g", { key: i, transform: geomTransform, clipPath: geom.value.mark !== null ? "url(#".concat(clipPathId, ")") : undefined },
                        react_1.default.createElement("path", { d: d, stroke: (0, color_library_wrappers_1.RGBATupleToString)(color), strokeWidth: 4, transform: "translate(".concat(x, ", ").concat(y, ") rotate(").concat(rotate || 0, ")"), fill: "transparent" })));
                }
                return (react_1.default.createElement("rect", { key: i, x: x, y: y, width: geom.width, height: geom.height, transform: geomTransform, className: "echHighlighterOverlay__fill", clipPath: "url(#".concat(clipPathId, ")") }));
            })));
    };
    HighlighterComponent.displayName = 'Highlighter';
    return HighlighterComponent;
}(react_1.default.Component));
var mapStateToProps = function (state) {
    var chartId = state.chartId, zIndex = state.zIndex;
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            initialized: false,
            chartId: chartId,
            zIndex: zIndex,
            highlightedGeometries: [],
            chartTransform: {
                x: 0,
                y: 0,
                rotate: 0,
            },
            chartDimensions: { top: 0, left: 0, width: 0, height: 0 },
            chartRotation: 0,
        };
    }
    return {
        initialized: true,
        chartId: chartId,
        zIndex: zIndex,
        highlightedGeometries: (0, get_tooltip_values_highlighted_geoms_1.getHighlightedGeomsSelector)(state),
        chartTransform: (0, compute_chart_transform_1.computeChartTransformSelector)(state),
        chartDimensions: (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(state).chartDimensions,
        chartRotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
    };
};
exports.Highlighter = (0, react_redux_1.connect)(mapStateToProps)(HighlighterComponent);
//# sourceMappingURL=highlighter.js.map