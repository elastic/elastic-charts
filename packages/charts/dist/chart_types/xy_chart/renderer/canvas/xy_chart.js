"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XYChart = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const renderers_1 = require("./renderers");
const has_mostly_rtl_1 = require("./utils/has_mostly_rtl");
const accessibility_1 = require("../../../../components/accessibility");
const specs_1 = require("../../../../specs");
const chart_1 = require("../../../../state/actions/chart");
const compute_panels_1 = require("../../../../state/selectors/compute_panels");
const get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
const get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
const get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const fast_deep_equal_1 = require("../../../../utils/fast_deep_equal");
const light_theme_1 = require("../../../../utils/themes/light_theme");
const compute_annotations_1 = require("../../state/selectors/compute_annotations");
const compute_chart_dimensions_1 = require("../../state/selectors/compute_chart_dimensions");
const compute_chart_transform_1 = require("../../state/selectors/compute_chart_transform");
const compute_per_panel_axes_geoms_1 = require("../../state/selectors/compute_per_panel_axes_geoms");
const compute_series_geometries_1 = require("../../state/selectors/compute_series_geometries");
const get_axis_styles_1 = require("../../state/selectors/get_axis_styles");
const get_grid_lines_1 = require("../../state/selectors/get_grid_lines");
const get_highlighted_annotation_ids_selector_1 = require("../../state/selectors/get_highlighted_annotation_ids_selector");
const get_highlighted_series_1 = require("../../state/selectors/get_highlighted_series");
const get_specs_1 = require("../../state/selectors/get_specs");
const is_chart_empty_1 = require("../../state/selectors/is_chart_empty");
const indexed_geometry_map_1 = require("../../utils/indexed_geometry_map");
class XYChartComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.ctx = null;
        this.devicePixelRatio = window.devicePixelRatio;
        this.animationState = { rafId: NaN, pool: new Map() };
    }
    componentDidMount() {
        this.tryCanvasContext();
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    }
    shouldComponentUpdate(nextProps) {
        return !(0, fast_deep_equal_1.deepEqual)(this.props, nextProps);
    }
    componentDidUpdate() {
        if (!this.ctx) {
            this.tryCanvasContext();
        }
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    }
    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationState.rafId);
        this.animationState.pool.clear();
    }
    drawCanvas() {
        if (this.ctx) {
            (0, renderers_1.renderXYChartCanvas2d)(this.ctx, this.devicePixelRatio, this.props, this.animationState);
        }
    }
    tryCanvasContext() {
        const canvas = this.props.forwardCanvasRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    }
    render() {
        const { forwardCanvasRef, initialized, isChartEmpty, chartContainerDimensions: { width, height }, a11ySettings, debug, isRTL, } = this.props;
        if (!initialized || isChartEmpty) {
            this.ctx = null;
            return null;
        }
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
                react_1.default.createElement("canvas", { dir: isRTL ? 'rtl' : 'ltr', ref: forwardCanvasRef, className: "echCanvasRenderer", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, style: {
                        width,
                        height,
                    }, role: "presentation" }),
                !debug && react_1.default.createElement(accessibility_1.ScreenReaderSummary, null)),
            debug && react_1.default.createElement(accessibility_1.ScreenReaderSummary, null)));
    }
}
XYChartComponent.displayName = 'XYChart';
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onChartRendered: chart_1.onChartRendered,
}, dispatch);
const DEFAULT_PROPS = {
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
    locale: specs_1.settingsBuildProps.defaults.locale,
};
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    const { geometries, geometriesIndex } = (0, compute_series_geometries_1.computeSeriesGeometriesSelector)(state);
    const { debug, locale } = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    const perPanelAxisGeoms = (0, compute_per_panel_axes_geoms_1.computePerPanelAxesGeomsSelector)(state);
    return {
        locale,
        isRTL: (0, has_mostly_rtl_1.hasMostlyRTL)(perPanelAxisGeoms),
        initialized: true,
        isChartEmpty: (0, is_chart_empty_1.isChartEmptySelector)(state),
        debug,
        geometries,
        geometriesIndex,
        theme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        chartContainerDimensions: (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state),
        highlightedLegendItem: (0, get_highlighted_series_1.getHighlightedSeriesSelector)(state),
        hoveredAnnotationIds: (0, get_highlighted_annotation_ids_selector_1.getHighlightedAnnotationIdsSelector)(state),
        rotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
        renderingArea: (0, compute_chart_dimensions_1.computeChartDimensionsSelector)(state).chartDimensions,
        chartTransform: (0, compute_chart_transform_1.computeChartTransformSelector)(state),
        axesSpecs: (0, get_specs_1.getAxisSpecsSelector)(state),
        perPanelAxisGeoms,
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