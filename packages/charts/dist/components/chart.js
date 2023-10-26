"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chart = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const uuid_1 = require("uuid");
const chart_background_1 = require("./chart_background");
const chart_container_1 = require("./chart_container");
const chart_resizer_1 = require("./chart_resizer");
const chart_status_1 = require("./chart_status");
const error_boundary_1 = require("./error_boundary");
const legend_1 = require("./legend/legend");
const utils_1 = require("./portal/utils");
const colors_1 = require("../common/colors");
const specs_parser_1 = require("../specs/specs_parser");
const chart_settings_1 = require("../state/actions/chart_settings");
const events_1 = require("../state/actions/events");
const z_index_1 = require("../state/actions/z_index");
const chart_state_1 = require("../state/chart_state");
const get_chart_theme_1 = require("../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../state/selectors/get_internal_is_intialized");
const get_legend_config_selector_1 = require("../state/selectors/get_legend_config_selector");
const chart_size_1 = require("../utils/chart_size");
const common_1 = require("../utils/common");
const light_theme_1 = require("../utils/themes/light_theme");
class Chart extends react_1.default.Component {
    constructor(props) {
        var _a;
        super(props);
        this.getChartContainerRef = () => this.chartContainerRef;
        this.chartContainerRef = (0, react_1.createRef)();
        this.chartStageRef = (0, react_1.createRef)();
        const id = (_a = props.id) !== null && _a !== void 0 ? _a : (0, uuid_1.v4)();
        const storeReducer = (0, chart_state_1.chartStoreReducer)(id, props.title, props.description);
        this.chartStore = (0, redux_1.createStore)(storeReducer);
        this.state = {
            legendDirection: common_1.LayoutDirection.Vertical,
            paddingLeft: light_theme_1.LIGHT_THEME.chartMargins.left,
            paddingRight: light_theme_1.LIGHT_THEME.chartMargins.right,
            displayTitles: true,
        };
        this.unsubscribeToStore = this.chartStore.subscribe(() => {
            var _a, _b;
            const state = this.chartStore.getState();
            if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
                return;
            }
            const { legendPosition: { direction }, } = (0, get_legend_config_selector_1.getLegendConfigSelector)(state);
            if (this.state.legendDirection !== direction) {
                this.setState({
                    legendDirection: direction,
                });
            }
            const theme = (0, get_chart_theme_1.getChartThemeSelector)(state);
            this.setState({
                paddingLeft: theme.chartMargins.left,
                paddingRight: theme.chartMargins.right,
                displayTitles: (_b = (_a = state.internalChartState) === null || _a === void 0 ? void 0 : _a.canDisplayChartTitles(state)) !== null && _b !== void 0 ? _b : true,
            });
            if (state.internalChartState) {
                state.internalChartState.eventCallbacks(state);
            }
        });
    }
    componentDidMount() {
        if (this.chartContainerRef.current) {
            const zIndex = (0, utils_1.getElementZIndex)(this.chartContainerRef.current, document.body);
            this.chartStore.dispatch((0, z_index_1.onComputedZIndex)(zIndex));
        }
    }
    componentWillUnmount() {
        this.unsubscribeToStore();
    }
    componentDidUpdate({ title, description }) {
        if (title !== this.props.title || description !== this.props.description) {
            this.chartStore.dispatch((0, chart_settings_1.updateChartTitles)(this.props.title, this.props.description));
        }
    }
    getPNGSnapshot(options = {
        backgroundColor: colors_1.Colors.Transparent.keyword,
    }) {
        if (!this.chartStageRef.current) {
            return null;
        }
        const canvas = this.chartStageRef.current;
        const backgroundCanvas = document.createElement('canvas');
        backgroundCanvas.width = canvas.width;
        backgroundCanvas.height = canvas.height;
        const bgCtx = backgroundCanvas.getContext('2d');
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
    }
    dispatchExternalPointerEvent(event) {
        this.chartStore.dispatch((0, events_1.onExternalPointerEvent)(event));
    }
    render() {
        const { size, className } = this.props;
        const containerSizeStyle = (0, chart_size_1.getChartSize)(size);
        const chartContentClassNames = (0, classnames_1.default)('echChartContent', className, {
            'echChartContent--column': this.state.legendDirection === common_1.LayoutDirection.Horizontal,
        });
        return (react_1.default.createElement(react_redux_1.Provider, { store: this.chartStore },
            react_1.default.createElement("div", { className: "echChart", style: containerSizeStyle },
                react_1.default.createElement(Titles, { displayTitles: this.state.displayTitles, title: this.props.title, description: this.props.description, paddingLeft: this.state.paddingLeft, paddingRight: this.state.paddingRight }),
                react_1.default.createElement("div", { className: chartContentClassNames },
                    react_1.default.createElement(chart_background_1.ChartBackground, null),
                    react_1.default.createElement(chart_status_1.ChartStatus, null),
                    react_1.default.createElement(chart_resizer_1.ChartResizer, null),
                    react_1.default.createElement(legend_1.Legend, null),
                    react_1.default.createElement(error_boundary_1.ErrorBoundary, null,
                        react_1.default.createElement(specs_parser_1.SpecsParser, null, this.props.children),
                        react_1.default.createElement("div", { className: "echContainer", ref: this.chartContainerRef },
                            react_1.default.createElement(chart_container_1.ChartContainer, { getChartContainerRef: this.getChartContainerRef, forwardStageRef: this.chartStageRef })))))));
    }
}
exports.Chart = Chart;
Chart.defaultProps = {
    renderer: 'canvas',
};
function Titles({ displayTitles, title, description, paddingLeft, paddingRight, }) {
    if (!displayTitles || (!title && !description))
        return null;
    const titleDescStyle = {
        paddingLeft,
        paddingRight,
    };
    return (react_1.default.createElement("div", { className: "echChart__titles" },
        title && (react_1.default.createElement("h3", { className: "echChartTitle", style: titleDescStyle }, title)),
        description && (react_1.default.createElement("h4", { className: "echChartDescription", style: titleDescStyle }, description))));
}
//# sourceMappingURL=chart.js.map