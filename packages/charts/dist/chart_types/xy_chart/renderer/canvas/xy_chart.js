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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XYChart = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var accessibility_1 = require("../../../../components/accessibility");
var chart_1 = require("../../../../state/actions/chart");
var get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
var get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
var get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var fast_deep_equal_1 = require("../../../../utils/fast_deep_equal");
var light_theme_1 = require("../../../../utils/themes/light_theme");
var compute_annotations_1 = require("../../state/selectors/compute_annotations");
var compute_chart_dimensions_1 = require("../../state/selectors/compute_chart_dimensions");
var compute_chart_transform_1 = require("../../state/selectors/compute_chart_transform");
var compute_panels_1 = require("../../state/selectors/compute_panels");
var compute_per_panel_axes_geoms_1 = require("../../state/selectors/compute_per_panel_axes_geoms");
var compute_series_geometries_1 = require("../../state/selectors/compute_series_geometries");
var get_axis_styles_1 = require("../../state/selectors/get_axis_styles");
var get_grid_lines_1 = require("../../state/selectors/get_grid_lines");
var get_highlighted_annotation_ids_selector_1 = require("../../state/selectors/get_highlighted_annotation_ids_selector");
var get_highlighted_series_1 = require("../../state/selectors/get_highlighted_series");
var get_specs_1 = require("../../state/selectors/get_specs");
var is_chart_empty_1 = require("../../state/selectors/is_chart_empty");
var indexed_geometry_map_1 = require("../../utils/indexed_geometry_map");
var renderers_1 = require("./renderers");
var has_mostly_rtl_1 = require("./utils/has_mostly_rtl");
var XYChartComponent = (function (_super) {
    __extends(XYChartComponent, _super);
    function XYChartComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.ctx = null;
        _this.devicePixelRatio = window.devicePixelRatio;
        _this.animationState = { rafId: NaN, pool: new Map() };
        return _this;
    }
    XYChartComponent.prototype.componentDidMount = function () {
        this.tryCanvasContext();
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    };
    XYChartComponent.prototype.shouldComponentUpdate = function (nextProps) {
        return !(0, fast_deep_equal_1.deepEqual)(this.props, nextProps);
    };
    XYChartComponent.prototype.componentDidUpdate = function () {
        if (!this.ctx) {
            this.tryCanvasContext();
        }
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    };
    XYChartComponent.prototype.componentWillUnmount = function () {
        window.cancelAnimationFrame(this.animationState.rafId);
        this.animationState.pool.clear();
    };
    XYChartComponent.prototype.drawCanvas = function () {
        if (this.ctx) {
            (0, renderers_1.renderXYChartCanvas2d)(this.ctx, this.devicePixelRatio, this.props, this.animationState);
        }
    };
    XYChartComponent.prototype.tryCanvasContext = function () {
        var canvas = this.props.forwardCanvasRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    };
    XYChartComponent.prototype.render = function () {
        var _a = this.props, forwardCanvasRef = _a.forwardCanvasRef, initialized = _a.initialized, isChartEmpty = _a.isChartEmpty, _b = _a.chartContainerDimensions, width = _b.width, height = _b.height, a11ySettings = _a.a11ySettings, debug = _a.debug, isRTL = _a.isRTL;
        if (!initialized || isChartEmpty) {
            this.ctx = null;
            return null;
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
                react_1.default.createElement("canvas", { dir: isRTL ? 'rtl' : 'ltr', ref: forwardCanvasRef, className: "echCanvasRenderer", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, style: {
                        width: width,
                        height: height,
                    }, role: "presentation" }),
                !debug && react_1.default.createElement(accessibility_1.ScreenReaderSummary, null)),
            debug && react_1.default.createElement(accessibility_1.ScreenReaderSummary, null)));
    };
    XYChartComponent.displayName = 'XYChart';
    return XYChartComponent;
}(react_1.default.Component));
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onChartRendered: chart_1.onChartRendered,
    }, dispatch);
};
var DEFAULT_PROPS = {
    isRTL: false,
    initialized: false,
    debug: false,
    isChartEmpty: true,
    geometries: {
        areas: [],
        bars: [],
        lines: [],
        points: [],
        bubbles: [],
    },
    geometriesIndex: new indexed_geometry_map_1.IndexedGeometryMap(),
    theme: light_theme_1.LIGHT_THEME,
    chartContainerDimensions: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    rotation: 0,
    renderingArea: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    chartTransform: {
        x: 0,
        y: 0,
        rotate: 0,
    },
    axesSpecs: [],
    perPanelAxisGeoms: [],
    perPanelGridLines: [],
    axesStyles: new Map(),
    hoveredAnnotationIds: [],
    annotationDimensions: new Map(),
    annotationSpecs: [],
    panelGeoms: [],
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
};
var mapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    var _a = (0, compute_series_geometries_1.computeSeriesGeometriesSelector)(state), geometries = _a.geometries, geometriesIndex = _a.geometriesIndex;
    var debug = (0, get_settings_spec_1.getSettingsSpecSelector)(state).debug;
    var perPanelAxisGeoms = (0, compute_per_panel_axes_geoms_1.computePerPanelAxesGeomsSelector)(state);
    return {
        isRTL: (0, has_mostly_rtl_1.hasMostlyRTL)(perPanelAxisGeoms),
        initialized: true,
        isChartEmpty: (0, is_chart_empty_1.isChartEmptySelector)(state),
        debug: debug,
        geometries: geometries,
        geometriesIndex: geometriesIndex,
        theme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        chartContainerDimensions: (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state),
        highlightedLegendItem: (0, get_highlighted_series_1.getHighlightedSeriesSelector)(state),
        hoveredAnnotationIds: (0, get_highlighted_annotation_ids_selector_1.getHighlightedAnnotationIdsSelector)(state),
        rotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
        renderingArea: (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(state).chartDimensions,
        chartTransform: (0, compute_chart_transform_1.computeChartTransformSelector)(state),
        axesSpecs: (0, get_specs_1.getAxisSpecsSelector)(state),
        perPanelAxisGeoms: perPanelAxisGeoms,
        perPanelGridLines: (0, get_grid_lines_1.getGridLinesSelector)(state),
        axesStyles: (0, get_axis_styles_1.getAxesStylesSelector)(state),
        annotationDimensions: (0, compute_annotations_1.computeAnnotationDimensionsSelector)(state),
        annotationSpecs: (0, get_specs_1.getAnnotationSpecsSelector)(state),
        panelGeoms: (0, compute_panels_1.computePanelsSelectors)(state),
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
    };
};
exports.XYChart = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(XYChartComponent);
//# sourceMappingURL=xy_chart.js.map