"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeslipWithTooltip = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const timeslip_render_1 = require("./timeslip/timeslip_render");
const __1 = require("..");
const constants_1 = require("../../common/constants");
const specs_1 = require("../../specs");
const chart_1 = require("../../state/actions/chart");
const get_accessibility_config_1 = require("../../state/selectors/get_accessibility_config");
const get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
const get_tooltip_spec_1 = require("../../state/selectors/get_tooltip_spec");
const utils_1 = require("../../state/utils");
const common_1 = require("../flame_chart/render/common");
class TimeslipComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.ctx = null;
        this.componentDidMount = () => {
            var _a;
            this.tryCanvasContext();
            this.drawCanvas();
            this.props.onChartRendered();
            (_a = this.props.containerRef().current) === null || _a === void 0 ? void 0 : _a.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
            const canvas = this.props.forwardStageRef.current;
            if (canvas && this.ctx)
                (0, timeslip_render_1.timeslipRender)(canvas, this.ctx, this.props.getData);
        };
        this.componentDidUpdate = () => {
            if (!this.ctx)
                this.tryCanvasContext();
        };
        this.render = () => {
            const { forwardStageRef, chartDimensions: { width: requestedWidth, height: requestedHeight }, a11ySettings, } = this.props;
            const width = (0, common_1.roundUpSize)(requestedWidth);
            const height = (0, common_1.roundUpSize)(requestedHeight);
            const style = {
                width,
                height,
                top: 0,
                left: 0,
                padding: 0,
                margin: 0,
                border: 0,
                position: 'absolute',
                cursor: constants_1.DEFAULT_CSS_CURSOR,
                touchAction: 'none',
            };
            const dpr = window.devicePixelRatio;
            const canvasWidth = width * dpr;
            const canvasHeight = height * dpr;
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
                    react_1.default.createElement("canvas", { ref: forwardStageRef, tabIndex: 0, className: "echCanvasRenderer", width: canvasWidth, height: canvasHeight, style: { ...style, outline: 'none' }, role: "presentation" }))));
        };
        this.drawCanvas = () => {
            if (!this.ctx)
                return;
            this.props.onRenderChange(true);
        };
        this.tryCanvasContext = () => {
            const canvas = this.props.forwardStageRef.current;
            this.ctx = canvas && canvas.getContext('2d');
        };
    }
    componentWillUnmount() {
        var _a;
        (_a = this.props.containerRef().current) === null || _a === void 0 ? void 0 : _a.removeEventListener('wheel', (e) => e.preventDefault());
    }
}
TimeslipComponent.displayName = 'Timeslip';
const mapStateToProps = (state) => {
    var _a, _b, _c, _d, _e;
    const timeslipSpec = (0, utils_1.getSpecsFromStore)(state.specs, __1.ChartType.Timeslip, specs_1.SpecType.Series)[0];
    const settingsSpec = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    return {
        getData: (_a = timeslipSpec === null || timeslipSpec === void 0 ? void 0 : timeslipSpec.getData) !== null && _a !== void 0 ? _a : (() => []),
        chartDimensions: state.parentDimensions,
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        tooltipRequired: (0, get_tooltip_spec_1.getTooltipSpecSelector)(state).type !== specs_1.TooltipType.None,
        onElementOver: (_b = settingsSpec.onElementOver) !== null && _b !== void 0 ? _b : (() => { }),
        onElementClick: (_c = settingsSpec.onElementClick) !== null && _c !== void 0 ? _c : (() => { }),
        onElementOut: (_d = settingsSpec.onElementOut) !== null && _d !== void 0 ? _d : (() => { }),
        onRenderChange: (_e = settingsSpec.onRenderChange) !== null && _e !== void 0 ? _e : (() => { }),
    };
};
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onChartRendered: chart_1.onChartRendered,
}, dispatch);
const TimeslipChartLayers = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(TimeslipComponent);
const TimeslipWithTooltip = (containerRef, forwardStageRef) => (react_1.default.createElement(TimeslipChartLayers, { forwardStageRef: forwardStageRef, containerRef: containerRef }));
exports.TimeslipWithTooltip = TimeslipWithTooltip;
//# sourceMappingURL=timeslip_chart.js.map