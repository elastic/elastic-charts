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
exports.Metric = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var chart_1 = require("../../../../state/actions/chart");
var get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var light_theme_1 = require("../../../../utils/themes/light_theme");
var chart_size_1 = require("../../state/selectors/chart_size");
var data_1 = require("../../state/selectors/data");
var metric_1 = require("./metric");
var Component = (function (_super) {
    __extends(Component, _super);
    function Component() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Component.prototype.componentDidMount = function () {
        this.props.onChartRendered();
    };
    Component.prototype.componentDidUpdate = function () {
        this.props.onChartRendered();
    };
    Component.prototype.render = function () {
        var _a = this.props, chartId = _a.chartId, initialized = _a.initialized, _b = _a.size, width = _b.width, height = _b.height, a11y = _a.a11y, specs = _a.specs, style = _a.style, onElementClick = _a.onElementClick, onElementOut = _a.onElementOut, onElementOver = _a.onElementOver;
        if (!initialized || specs.length === 0 || width === 0 || height === 0) {
            return null;
        }
        var data = specs[0].data;
        var totalRows = data.length;
        var totalColumns = data.reduce(function (acc, curr) {
            return Math.max(acc, curr.length);
        }, 0);
        var panel = { width: width / totalColumns, height: height / totalRows };
        return (react_1.default.createElement("ul", { role: "list", className: "echMetricContainer", "aria-labelledby": a11y.labelId, "aria-describedby": a11y.descriptionId, style: {
                gridTemplateColumns: "repeat(".concat(totalColumns, ", minmax(0, 1fr)"),
                gridTemplateRows: "repeat(".concat(totalRows, ", minmax(64px, 1fr)"),
            } }, data.flatMap(function (columns, rowIndex) {
            return __spreadArray(__spreadArray([], __read(columns.map(function (datum, columnIndex) {
                var emptyMetricClassName = (0, classnames_1.default)('echMetric', {
                    'echMetric--rightBorder': columnIndex < totalColumns - 1,
                    'echMetric--bottomBorder': rowIndex < totalRows - 1,
                });
                if (!datum) {
                    return (react_1.default.createElement("li", { key: "empty-".concat(columnIndex), role: "presentation" },
                        react_1.default.createElement("div", { className: emptyMetricClassName })));
                }
                return (react_1.default.createElement("li", { key: "".concat(datum.title).concat(datum.subtitle).concat(datum.color).concat(columnIndex) },
                    react_1.default.createElement(metric_1.Metric, { chartId: chartId, datum: datum, totalRows: totalRows, totalColumns: totalColumns, rowIndex: rowIndex, columnIndex: columnIndex, panel: panel, style: style, onElementClick: onElementClick, onElementOut: onElementOut, onElementOver: onElementOver })));
            })), false), __read(Array.from({ length: totalColumns - columns.length }, function (_, columIndex) {
                var emptyMetricClassName = (0, classnames_1.default)('echMetric', {
                    'echMetric--rightBorder': columns.length + columIndex < totalColumns - 1,
                    'echMetric--bottomBorder': rowIndex < totalRows - 1,
                });
                return (react_1.default.createElement("li", { key: "missing-".concat(columIndex), role: "presentation" },
                    react_1.default.createElement("div", { className: emptyMetricClassName })));
            })), false);
        })));
    };
    Component.displayName = 'Metric';
    return Component;
}(react_1.default.Component));
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onChartRendered: chart_1.onChartRendered,
    }, dispatch);
};
var DEFAULT_PROPS = {
    initialized: false,
    chartId: '',
    specs: [],
    size: {
        width: 0,
        height: 0,
    },
    a11y: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    style: light_theme_1.LIGHT_THEME.metric,
};
var mapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    var _a = (0, get_settings_spec_1.getSettingsSpecSelector)(state), onElementClick = _a.onElementClick, onElementOut = _a.onElementOut, onElementOver = _a.onElementOver;
    return {
        initialized: true,
        chartId: state.chartId,
        specs: (0, data_1.getMetricSpecs)(state),
        size: (0, chart_size_1.chartSize)(state),
        a11y: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        onElementClick: onElementClick,
        onElementOver: onElementOver,
        onElementOut: onElementOut,
        style: (0, get_chart_theme_1.getChartThemeSelector)(state).metric,
    };
};
exports.Metric = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(Component);
//# sourceMappingURL=index.js.map