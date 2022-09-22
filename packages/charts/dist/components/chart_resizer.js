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
exports.ChartResizer = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var resize_observer_polyfill_1 = __importDefault(require("resize-observer-polyfill"));
var chart_settings_1 = require("../state/actions/chart_settings");
var get_settings_spec_1 = require("../state/selectors/get_settings_spec");
var common_1 = require("../utils/common");
var debounce_1 = require("../utils/debounce");
var DEFAULT_RESIZE_DEBOUNCE = 200;
var Resizer = (function (_super) {
    __extends(Resizer, _super);
    function Resizer(props) {
        var _this = _super.call(this, props) || this;
        _this.initialResizeComplete = false;
        _this.onResize = function (entries) {
            if (!Array.isArray(entries)) {
                return;
            }
            if (entries.length === 0 || !entries[0]) {
                return;
            }
            var _a = entries[0].contentRect, width = _a.width, height = _a.height;
            _this.animationFrameID = window.requestAnimationFrame(function () {
                _this.props.updateParentDimensions({ width: width, height: height, top: 0, left: 0 });
            });
        };
        _this.handleResize = function (entries) {
            var _a;
            if (_this.initialResizeComplete) {
                (_a = _this.onResizeDebounced) === null || _a === void 0 ? void 0 : _a.call(_this, entries);
            }
            else {
                _this.initialResizeComplete = true;
                _this.onResize(entries);
            }
        };
        _this.containerRef = react_1.default.createRef();
        _this.ro = new resize_observer_polyfill_1.default(_this.handleResize);
        _this.animationFrameID = NaN;
        return _this;
    }
    Resizer.prototype.componentDidMount = function () {
        this.onResizeDebounced = (0, debounce_1.debounce)(this.onResize, this.props.resizeDebounce);
        if (this.containerRef.current) {
            this.ro.observe(this.containerRef.current);
        }
    };
    Resizer.prototype.componentWillUnmount = function () {
        window.cancelAnimationFrame(this.animationFrameID);
        this.ro.disconnect();
    };
    Resizer.prototype.render = function () {
        return react_1.default.createElement("div", { ref: this.containerRef, className: "echChartResizer" });
    };
    return Resizer;
}(react_1.default.Component));
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        updateParentDimensions: chart_settings_1.updateParentDimensions,
    }, dispatch);
};
var mapStateToProps = function (state) {
    var resizeDebounce = (0, get_settings_spec_1.getSettingsSpecSelector)(state).resizeDebounce;
    return {
        resizeDebounce: (0, common_1.isFiniteNumber)(resizeDebounce) ? resizeDebounce : DEFAULT_RESIZE_DEBOUNCE,
    };
};
exports.ChartResizer = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(Resizer);
//# sourceMappingURL=chart_resizer.js.map