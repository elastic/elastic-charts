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
exports.ChartStatus = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var create_selector_1 = require("../state/create_selector");
var get_debug_state_1 = require("../state/selectors/get_debug_state");
var get_settings_spec_1 = require("../state/selectors/get_settings_spec");
var ChartStatusComponent = (function (_super) {
    __extends(ChartStatusComponent, _super);
    function ChartStatusComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dispatchRenderChange = function () {
            var _a, _b;
            (_b = (_a = _this.props).onRenderChange) === null || _b === void 0 ? void 0 : _b.call(_a, _this.props.rendered);
        };
        return _this;
    }
    ChartStatusComponent.prototype.componentDidMount = function () {
        this.dispatchRenderChange();
    };
    ChartStatusComponent.prototype.componentDidUpdate = function () {
        this.dispatchRenderChange();
    };
    ChartStatusComponent.prototype.componentWillUnmount = function () {
        create_selector_1.globalSelectorCache.removeKeyFromAll(this.props.chartId);
    };
    ChartStatusComponent.prototype.render = function () {
        var _a = this.props, rendered = _a.rendered, renderedCount = _a.renderedCount, debugState = _a.debugState;
        var debugStateString = debugState && JSON.stringify(debugState);
        return (react_1.default.createElement("div", { className: "echChartStatus", "data-ech-render-complete": rendered, "data-ech-render-count": renderedCount, "data-ech-debug-state": debugStateString }));
    };
    return ChartStatusComponent;
}(react_1.default.Component));
var mapStateToProps = function (state) {
    var _a = (0, get_settings_spec_1.getSettingsSpecSelector)(state), onRenderChange = _a.onRenderChange, debugState = _a.debugState;
    return {
        chartId: state.chartId,
        rendered: state.chartRendered,
        renderedCount: state.chartRenderedCount,
        onRenderChange: onRenderChange,
        debugState: debugState ? (0, get_debug_state_1.getDebugStateSelector)(state) : null,
    };
};
exports.ChartStatus = (0, react_redux_1.connect)(mapStateToProps)(ChartStatusComponent);
//# sourceMappingURL=chart_status.js.map