"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartStatus = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const create_selector_1 = require("../state/create_selector");
const get_debug_state_1 = require("../state/selectors/get_debug_state");
const get_settings_spec_1 = require("../state/selectors/get_settings_spec");
class ChartStatusComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.dispatchRenderChange = () => {
            const { onWillRender, onRenderChange, rendered } = this.props;
            onWillRender === null || onWillRender === void 0 ? void 0 : onWillRender();
            if (onRenderChange) {
                window.requestAnimationFrame(() => {
                    onRenderChange(rendered);
                });
            }
        };
    }
    componentDidMount() {
        this.dispatchRenderChange();
    }
    componentDidUpdate() {
        this.dispatchRenderChange();
    }
    componentWillUnmount() {
        create_selector_1.globalSelectorCache.removeKeyFromAll(this.props.chartId);
    }
    render() {
        const { rendered, renderedCount, debugState } = this.props;
        const debugStateString = debugState && JSON.stringify(debugState);
        return (react_1.default.createElement("div", { className: "echChartStatus", "data-ech-render-complete": rendered, "data-ech-render-count": renderedCount, "data-ech-debug-state": debugStateString }));
    }
}
const mapStateToProps = (state) => {
    const { onWillRender, onRenderChange, debugState } = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    return {
        chartId: state.chartId,
        rendered: state.chartRendered,
        renderedCount: state.chartRenderedCount,
        onWillRender,
        onRenderChange,
        debugState: debugState ? (0, get_debug_state_1.getDebugStateSelector)(state) : null,
    };
};
exports.ChartStatus = (0, react_redux_1.connect)(mapStateToProps)(ChartStatusComponent);
//# sourceMappingURL=chart_status.js.map