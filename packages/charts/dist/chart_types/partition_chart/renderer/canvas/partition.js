"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partition = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const canvas_linear_renderers_1 = require("./canvas_linear_renderers");
const canvas_renderers_1 = require("./canvas_renderers");
const canvas_wrapped_renderers_1 = require("./canvas_wrapped_renderers");
const colors_1 = require("../../../../common/colors");
const accessibility_1 = require("../../../../components/accessibility");
const canvas_1 = require("../../../../renderers/canvas");
const chart_1 = require("../../../../state/actions/chart");
const get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
const get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const config_1 = require("../../layout/config");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const group_by_rollup_1 = require("../../layout/utils/group_by_rollup");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
const geometries_1 = require("../../state/selectors/geometries");
class PartitionComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.ctx = null;
        this.devicePixelRatio = window.devicePixelRatio;
        this.animationState = { rafId: NaN };
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
        const { initialized, chartDimensions: { width, height }, forwardStageRef, } = this.props;
        const [focus] = this.props.geometriesFoci;
        if (!forwardStageRef.current || !this.ctx || !initialized || width === 0 || height === 0 || !focus) {
            return;
        }
        const picker = this.props.geometries.pickQuads;
        const box = forwardStageRef.current.getBoundingClientRect();
        const { diskCenter } = this.props.geometries;
        const x = e.clientX - box.left - diskCenter.x;
        const y = e.clientY - box.top - diskCenter.y;
        const pickedShapes = picker(x, y, focus);
        const datumIndices = new Set();
        pickedShapes.forEach((shape) => {
            const node = shape[config_1.MODEL_KEY];
            const shapeNode = node.children.find(([key]) => key === shape.dataName);
            if (shapeNode) {
                const indices = shapeNode[1][group_by_rollup_1.INPUT_KEY] || [];
                indices.forEach((i) => datumIndices.add(i));
            }
        });
        return pickedShapes;
    }
    render() {
        const { forwardStageRef, initialized, chartDimensions: { width, height }, a11ySettings, debug, isRTL, } = this.props;
        return width === 0 || height === 0 || !initialized ? null : (react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
            react_1.default.createElement("canvas", { dir: isRTL ? 'rtl' : 'ltr', ref: forwardStageRef, className: "echCanvasRenderer", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, onMouseMove: this.handleMouseMove.bind(this), style: {
                    width,
                    height,
                }, role: "presentation" },
                react_1.default.createElement(accessibility_1.ScreenReaderSummary, null),
                !debug && react_1.default.createElement(accessibility_1.ScreenReaderPartitionTable, null)),
            debug && react_1.default.createElement(accessibility_1.ScreenReaderPartitionTable, null)));
    }
    drawCanvas() {
        if (this.ctx) {
            const { ctx, devicePixelRatio, props } = this;
            (0, canvas_1.clearCanvas)(ctx, props.background);
            props.multiGeometries.forEach((geometries, geometryIndex) => {
                const focus = props.geometriesFoci[geometryIndex];
                if (!focus)
                    return;
                const renderer = (0, viewmodel_1.isSimpleLinear)(geometries.layout, geometries.style.fillLabel, geometries.layers)
                    ? canvas_linear_renderers_1.renderLinearPartitionCanvas2d
                    : (0, viewmodel_1.isWaffle)(geometries.layout)
                        ? canvas_wrapped_renderers_1.renderWrappedPartitionCanvas2d
                        : canvas_renderers_1.renderPartitionCanvas2d;
                renderer(ctx, devicePixelRatio, geometries, focus, this.animationState);
            });
        }
    }
    tryCanvasContext() {
        const canvas = this.props.forwardStageRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    }
}
PartitionComponent.displayName = 'Partition';
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({ onChartRendered: chart_1.onChartRendered }, dispatch);
const DEFAULT_PROPS = {
    isRTL: false,
    initialized: false,
    geometries: (0, viewmodel_types_1.nullShapeViewModel)(),
    geometriesFoci: [],
    multiGeometries: [],
    chartDimensions: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    debug: false,
    background: colors_1.Colors.Transparent.keyword,
};
const mapStateToProps = (state) => {
    var _a;
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    const multiGeometries = (0, geometries_1.partitionMultiGeometries)(state);
    return {
        isRTL: (0, viewmodel_types_1.hasMostlyRTLLabels)(multiGeometries),
        initialized: true,
        geometries: (_a = multiGeometries[0]) !== null && _a !== void 0 ? _a : (0, viewmodel_types_1.nullShapeViewModel)(),
        multiGeometries,
        chartDimensions: (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state),
        geometriesFoci: (0, geometries_1.partitionDrilldownFocus)(state),
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        debug: (0, get_settings_spec_1.getSettingsSpecSelector)(state).debug,
        background: (0, get_chart_theme_1.getChartThemeSelector)(state).background.color,
    };
};
exports.Partition = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(PartitionComponent);
//# sourceMappingURL=partition.js.map