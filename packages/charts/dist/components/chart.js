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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chart = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importStar(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var uuid_1 = __importDefault(require("uuid"));
var colors_1 = require("../common/colors");
var specs_parser_1 = require("../specs/specs_parser");
var events_1 = require("../state/actions/events");
var z_index_1 = require("../state/actions/z_index");
var chart_state_1 = require("../state/chart_state");
var get_internal_is_intialized_1 = require("../state/selectors/get_internal_is_intialized");
var get_legend_config_selector_1 = require("../state/selectors/get_legend_config_selector");
var chart_size_1 = require("../utils/chart_size");
var common_1 = require("../utils/common");
var chart_background_1 = require("./chart_background");
var chart_container_1 = require("./chart_container");
var chart_resizer_1 = require("./chart_resizer");
var chart_status_1 = require("./chart_status");
var error_boundary_1 = require("./error_boundary");
var legend_1 = require("./legend/legend");
var utils_1 = require("./portal/utils");
var getMiddlware = function (id) {
    var middlware = [];
    if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
        return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            trace: true,
            name: "@elastic/charts (id: ".concat(id, ")"),
        })(redux_1.applyMiddleware.apply(void 0, __spreadArray([], __read(middlware), false)));
    }
    return redux_1.applyMiddleware.apply(void 0, __spreadArray([], __read(middlware), false));
};
var Chart = (function (_super) {
    __extends(Chart, _super);
    function Chart(props) {
        var _this = this;
        var _a;
        _this = _super.call(this, props) || this;
        _this.getChartContainerRef = function () { return _this.chartContainerRef; };
        _this.chartContainerRef = (0, react_1.createRef)();
        _this.chartStageRef = (0, react_1.createRef)();
        var id = (_a = props.id) !== null && _a !== void 0 ? _a : uuid_1.default.v4();
        var storeReducer = (0, chart_state_1.chartStoreReducer)(id);
        var enhancer = getMiddlware(id);
        _this.chartStore = (0, redux_1.createStore)(storeReducer, enhancer);
        _this.state = {
            legendDirection: common_1.LayoutDirection.Vertical,
        };
        _this.unsubscribeToStore = _this.chartStore.subscribe(function () {
            var state = _this.chartStore.getState();
            if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
                return;
            }
            var direction = (0, get_legend_config_selector_1.getLegendConfigSelector)(state).legendPosition.direction;
            if (_this.state.legendDirection !== direction) {
                _this.setState({
                    legendDirection: direction,
                });
            }
            if (state.internalChartState) {
                state.internalChartState.eventCallbacks(state);
            }
        });
        return _this;
    }
    Chart.prototype.componentDidMount = function () {
        if (this.chartContainerRef.current) {
            var zIndex = (0, utils_1.getElementZIndex)(this.chartContainerRef.current, document.body);
            this.chartStore.dispatch((0, z_index_1.onComputedZIndex)(zIndex));
        }
    };
    Chart.prototype.componentWillUnmount = function () {
        this.unsubscribeToStore();
    };
    Chart.prototype.getPNGSnapshot = function (options) {
        if (options === void 0) { options = {
            backgroundColor: colors_1.Colors.Transparent.keyword,
        }; }
        if (!this.chartStageRef.current) {
            return null;
        }
        var canvas = this.chartStageRef.current;
        var backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.width = canvas.width;
        backgroundCanvas.height = canvas.height;
        var bgCtx = backgroundCanvas.getContext('2d');
        if (!bgCtx) {
            return null;
        }
        bgCtx.fillStyle = options.backgroundColor;
        bgCtx.fillRect(0, 0, canvas.width, canvas.height);
        bgCtx.drawImage(canvas, 0, 0);
        return {
            blobOrDataUrl: backgroundCanvas.toDataURL(),
            browser: 'other',
        };
    };
    Chart.prototype.dispatchExternalPointerEvent = function (event) {
        this.chartStore.dispatch((0, events_1.onExternalPointerEvent)(event));
    };
    Chart.prototype.render = function () {
        var _a = this.props, size = _a.size, className = _a.className;
        var containerSizeStyle = (0, chart_size_1.getChartSize)(size);
        var chartClassNames = (0, classnames_1.default)('echChart', className, {
            'echChart--column': this.state.legendDirection === common_1.LayoutDirection.Horizontal,
        });
        return (react_1.default.createElement(react_redux_1.Provider, { store: this.chartStore },
            react_1.default.createElement("div", { className: chartClassNames, style: containerSizeStyle },
                react_1.default.createElement(chart_background_1.ChartBackground, null),
                react_1.default.createElement(chart_status_1.ChartStatus, null),
                react_1.default.createElement(chart_resizer_1.ChartResizer, null),
                react_1.default.createElement(legend_1.Legend, null),
                react_1.default.createElement(error_boundary_1.ErrorBoundary, null,
                    react_1.default.createElement(specs_parser_1.SpecsParser, null, this.props.children),
                    react_1.default.createElement("div", { className: "echContainer", ref: this.chartContainerRef },
                        react_1.default.createElement(chart_container_1.ChartContainer, { getChartContainerRef: this.getChartContainerRef, forwardStageRef: this.chartStageRef }))))));
    };
    Chart.defaultProps = {
        renderer: 'canvas',
    };
    return Chart;
}(react_1.default.Component));
exports.Chart = Chart;
//# sourceMappingURL=chart.js.map