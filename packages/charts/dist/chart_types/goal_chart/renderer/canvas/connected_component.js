"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
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
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const geoms_1 = require("../../layout/viewmodel/geoms");
const geometries_1 = require("../../state/selectors/geometries");
const get_goal_chart_data_1 = require("../../state/selectors/get_goal_chart_data");
const picked_shapes_1 = require("../../state/selectors/picked_shapes");
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
    componentDidUpdate() {
        if (!this.ctx) {
            this.tryCanvasContext();
        }
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    }
    handleMouseMove(e) {
        const { initialized, chartContainerDimensions: { width, height }, forwardStageRef, geometries, captureBoundingBox: capture, } = this.props;
        if (!forwardStageRef.current || !this.ctx || !initialized || width === 0 || height === 0) {
            return;
        }
        const picker = geometries.pickQuads;
        const box = forwardStageRef.current.getBoundingClientRect();
        const { chartCenter } = geometries;
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        if (capture.x0 <= x && x <= capture.x1 && capture.y0 <= y && y <= capture.y1) {
            return picker(x - chartCenter.x, y - chartCenter.y);
        }
    }
    render() {
        const { initialized, chartContainerDimensions: { width, height }, forwardStageRef, a11ySettings, bandLabels, firstValue, } = this.props;
        if (!initialized || width === 0 || height === 0) {
            return null;
        }
        return (react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
            react_1.default.createElement("canvas", { ref: forwardStageRef, className: "echCanvasRenderer", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, onMouseMove: this.handleMouseMove.bind(this), style: {
                    width,
                    height,
                }, role: "presentation" },
                react_1.default.createElement(accessibility_1.ScreenReaderSummary, null),
                react_1.default.createElement(accessibility_1.GoalSemanticDescription, { bandLabels: bandLabels, firstValue: firstValue, ...a11ySettings }))));
    }
    tryCanvasContext() {
        const canvas = this.props.forwardStageRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    }
    drawCanvas() {
        if (this.ctx) {
            (0, canvas_renderers_1.renderCanvas2d)(this.ctx, this.devicePixelRatio, this.props.geoms, this.props.background);
        }
    }
}
Component.displayName = 'Goal';
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onChartRendered: chart_1.onChartRendered,
}, dispatch);
const DEFAULT_PROPS = {
    initialized: false,
    geometries: (0, viewmodel_types_1.nullShapeViewModel)(),
    geoms: [],
    chartContainerDimensions: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    bandLabels: [],
    firstValue: 0,
    captureBoundingBox: (0, geoms_1.initialBoundingBox)(),
    background: colors_1.Colors.Transparent.keyword,
};
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    return {
        initialized: true,
        geometries: (0, geometries_1.geometries)(state),
        chartContainerDimensions: state.parentDimensions,
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        bandLabels: (0, get_goal_chart_data_1.getGoalChartSemanticDataSelector)(state),
        firstValue: (0, get_goal_chart_data_1.getFirstTickValueSelector)(state),
        geoms: (0, geometries_1.getPrimitiveGeoms)(state),
        captureBoundingBox: (0, picked_shapes_1.getCaptureBoundingBox)(state),
        background: (0, get_chart_theme_1.getChartThemeSelector)(state).background.color,
    };
};
exports.Goal = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(Component);
//# sourceMappingURL=connected_component.js.map