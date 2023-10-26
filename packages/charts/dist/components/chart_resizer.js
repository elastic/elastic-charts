"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartResizer = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const resize_observer_polyfill_1 = __importDefault(require("resize-observer-polyfill"));
const chart_settings_1 = require("../state/actions/chart_settings");
const get_settings_spec_1 = require("../state/selectors/get_settings_spec");
const common_1 = require("../utils/common");
const debounce_1 = require("../utils/debounce");
const DEFAULT_RESIZE_DEBOUNCE = 200;
class Resizer extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.initialResizeComplete = false;
        this.onResize = (entries) => {
            if (!Array.isArray(entries)) {
                return;
            }
            if (entries.length === 0 || !entries[0]) {
                return;
            }
            const { width, height } = entries[0].contentRect;
            this.animationFrameID = window.requestAnimationFrame(() => {
                this.props.updateParentDimensions({ width, height, top: 0, left: 0 });
            });
        };
        this.handleResize = (entries) => {
            var _a;
            if (this.initialResizeComplete) {
                (_a = this.onResizeDebounced) === null || _a === void 0 ? void 0 : _a.call(this, entries);
            }
            else {
                this.initialResizeComplete = true;
                this.onResize(entries);
            }
        };
        this.containerRef = react_1.default.createRef();
        this.ro = new resize_observer_polyfill_1.default(this.handleResize);
        this.animationFrameID = NaN;
    }
    componentDidMount() {
        this.onResizeDebounced = (0, debounce_1.debounce)(this.onResize, this.props.resizeDebounce);
        if (this.containerRef.current) {
            this.ro.observe(this.containerRef.current);
        }
    }
    componentWillUnmount() {
        window.cancelAnimationFrame(this.animationFrameID);
        this.ro.disconnect();
    }
    render() {
        return react_1.default.createElement("div", { ref: this.containerRef, className: "echChartResizer" });
    }
}
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    updateParentDimensions: chart_settings_1.updateParentDimensions,
}, dispatch);
const mapStateToProps = (state) => {
    const { resizeDebounce } = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    return {
        resizeDebounce: (0, common_1.isFiniteNumber)(resizeDebounce) ? resizeDebounce : DEFAULT_RESIZE_DEBOUNCE,
    };
};
exports.ChartResizer = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(Resizer);
//# sourceMappingURL=chart_resizer.js.map