"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heatmap = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const canvas_renderers_1 = require("./canvas_renderers");
const colors_1 = require("../../../../common/colors");
const accessibility_1 = require("../../../../components/accessibility");
const chart_1 = require("../../../../state/actions/chart");
const get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const fast_deep_equal_1 = require("../../../../utils/fast_deep_equal");
const light_theme_1 = require("../../../../utils/themes/light_theme");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const compute_chart_element_sizes_1 = require("../../state/selectors/compute_chart_element_sizes");
const get_heatmap_container_size_1 = require("../../state/selectors/get_heatmap_container_size");
const get_highlighted_legend_bands_1 = require("../../state/selectors/get_highlighted_legend_bands");
const get_per_panel_heatmap_geometries_1 = require("../../state/selectors/get_per_panel_heatmap_geometries");
class Component extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.ctx = null;
        this.devicePixelRatio = window.devicePixelRatio;
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
    tryCanvasContext() {
        const canvas = this.props.forwardStageRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    }
    drawCanvas() {
        if (this.ctx) {
            (0, canvas_renderers_1.renderHeatmapCanvas2d)(this.ctx, this.devicePixelRatio, this.props);
        }
    }
    render() {
        const { initialized, chartContainerDimensions: { width, height }, forwardStageRef, a11ySettings, } = this.props;
        if (!initialized || width === 0 || height === 0) {
            return null;
        }
        return (react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
            react_1.default.createElement("canvas", { ref: forwardStageRef, className: "echCanvasRenderer", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, style: {
                    width,
                    height,
                }, role: "presentation" },
                react_1.default.createElement(accessibility_1.ScreenReaderSummary, null))));
    }
}
Component.displayName = 'Heatmap';
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onChartRendered: chart_1.onChartRendered,
}, dispatch);
const DEFAULT_PROPS = {
    initialized: false,
    geometries: (0, viewmodel_types_1.nullShapeViewModel)(),
    chartContainerDimensions: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    theme: light_theme_1.LIGHT_THEME,
    highlightedLegendBands: [],
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    background: colors_1.Colors.Transparent.keyword,
    elementSizes: {
        xAxis: { width: 0, height: 0, left: 0, top: 0 },
        yAxis: { width: 0, height: 0, left: 0, top: 0 },
        xAxisTickCadence: 1,
        xLabelRotation: 0,
    },
    debug: false,
};
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    return {
        initialized: true,
        geometries: (0, get_per_panel_heatmap_geometries_1.getPerPanelHeatmapGeometries)(state),
        chartContainerDimensions: (0, get_heatmap_container_size_1.getHeatmapContainerSizeSelector)(state),
        highlightedLegendBands: (0, get_highlighted_legend_bands_1.getHighlightedLegendBandsSelector)(state),
        theme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        background: (0, get_chart_theme_1.getChartThemeSelector)(state).background.color,
        elementSizes: (0, compute_chart_element_sizes_1.computeChartElementSizesSelector)(state),
        debug: (0, get_settings_spec_1.getSettingsSpecSelector)(state).debug,
    };
};
exports.Heatmap = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(Component);
//# sourceMappingURL=connected_component.js.map