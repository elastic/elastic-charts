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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeslipWithTooltip = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var __1 = require("..");
var constants_1 = require("../../common/constants");
var specs_1 = require("../../specs");
var chart_1 = require("../../state/actions/chart");
var get_accessibility_config_1 = require("../../state/selectors/get_accessibility_config");
var get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
var get_tooltip_spec_1 = require("../../state/selectors/get_tooltip_spec");
var utils_1 = require("../../state/utils");
var common_1 = require("../flame_chart/render/common");
var timeslip_render_1 = require("./timeslip/timeslip_render");
var TimeslipComponent = (function (_super) {
    __extends(TimeslipComponent, _super);
    function TimeslipComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ctx = null;
        _this.componentDidMount = function () {
            var _a;
            _this.tryCanvasContext();
            _this.drawCanvas();
            _this.props.onChartRendered();
            (_a = _this.props.containerRef().current) === null || _a === void 0 ? void 0 : _a.addEventListener('wheel', function (e) { return e.preventDefault(); }, { passive: false });
            (0, timeslip_render_1.timeslipRender)(_this.props.forwardStageRef.current, _this.ctx, _this.props.getData);
        };
        _this.componentDidUpdate = function () {
            if (!_this.ctx)
                _this.tryCanvasContext();
        };
        _this.render = function () {
            var _a = _this.props, forwardStageRef = _a.forwardStageRef, _b = _a.chartDimensions, requestedWidth = _b.width, requestedHeight = _b.height, a11ySettings = _a.a11ySettings;
            var width = (0, common_1.roundUpSize)(requestedWidth);
            var height = (0, common_1.roundUpSize)(requestedHeight);
            var style = {
                width: width,
                height: height,
                top: 0,
                left: 0,
                padding: 0,
                margin: 0,
                border: 0,
                position: 'absolute',
                cursor: constants_1.DEFAULT_CSS_CURSOR,
            };
            var dpr = window.devicePixelRatio;
            var canvasWidth = width * dpr;
            var canvasHeight = height * dpr;
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
                    react_1.default.createElement("canvas", { ref: forwardStageRef, tabIndex: 0, className: "echCanvasRenderer", width: canvasWidth, height: canvasHeight, style: __assign(__assign({}, style), { outline: 'none' }), role: "presentation" }))));
        };
        _this.drawCanvas = function () {
            if (!_this.ctx)
                return;
            _this.props.onRenderChange(true);
        };
        _this.tryCanvasContext = function () {
            var canvas = _this.props.forwardStageRef.current;
            _this.ctx = canvas && canvas.getContext('2d');
        };
        return _this;
    }
    TimeslipComponent.prototype.componentWillUnmount = function () {
        var _a;
        (_a = this.props.containerRef().current) === null || _a === void 0 ? void 0 : _a.removeEventListener('wheel', function (e) { return e.preventDefault(); });
    };
    TimeslipComponent.displayName = 'Timeslip';
    return TimeslipComponent;
}(react_1.default.Component));
var mapStateToProps = function (state) {
    var _a, _b, _c, _d, _e;
    var timeslipSpec = (0, utils_1.getSpecsFromStore)(state.specs, __1.ChartType.Timeslip, specs_1.SpecType.Series)[0];
    var settingsSpec = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    return {
        getData: (_a = timeslipSpec === null || timeslipSpec === void 0 ? void 0 : timeslipSpec.getData) !== null && _a !== void 0 ? _a : (function () { return []; }),
        chartDimensions: state.parentDimensions,
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        tooltipRequired: (0, get_tooltip_spec_1.getTooltipSpecSelector)(state).type !== specs_1.TooltipType.None,
        onElementOver: (_b = settingsSpec.onElementOver) !== null && _b !== void 0 ? _b : (function () { }),
        onElementClick: (_c = settingsSpec.onElementClick) !== null && _c !== void 0 ? _c : (function () { }),
        onElementOut: (_d = settingsSpec.onElementOut) !== null && _d !== void 0 ? _d : (function () { }),
        onRenderChange: (_e = settingsSpec.onRenderChange) !== null && _e !== void 0 ? _e : (function () { }),
    };
};
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onChartRendered: chart_1.onChartRendered,
    }, dispatch);
};
var TimeslipChartLayers = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(TimeslipComponent);
var TimeslipWithTooltip = function (containerRef, forwardStageRef) { return (react_1.default.createElement(TimeslipChartLayers, { forwardStageRef: forwardStageRef, containerRef: containerRef })); };
exports.TimeslipWithTooltip = TimeslipWithTooltip;
//# sourceMappingURL=timeslip_chart.js.map