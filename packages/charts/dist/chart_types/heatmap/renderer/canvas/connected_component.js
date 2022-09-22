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
exports.Heatmap = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var colors_1 = require("../../../../common/colors");
var accessibility_1 = require("../../../../components/accessibility");
var chart_1 = require("../../../../state/actions/chart");
var get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var compute_chart_dimensions_1 = require("../../state/selectors/compute_chart_dimensions");
var geometries_1 = require("../../state/selectors/geometries");
var get_heatmap_container_size_1 = require("../../state/selectors/get_heatmap_container_size");
var canvas_renderers_1 = require("./canvas_renderers");
var Component = (function (_super) {
    __extends(Component, _super);
    function Component(props) {
        var _this = _super.call(this, props) || this;
        _this.ctx = null;
        _this.devicePixelRatio = window.devicePixelRatio;
        return _this;
    }
    Component.prototype.componentDidMount = function () {
        this.tryCanvasContext();
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    };
    Component.prototype.componentDidUpdate = function () {
        if (!this.ctx) {
            this.tryCanvasContext();
        }
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    };
    Component.prototype.tryCanvasContext = function () {
        var canvas = this.props.forwardStageRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    };
    Component.prototype.drawCanvas = function () {
        if (this.ctx) {
            (0, canvas_renderers_1.renderCanvas2d)(this.ctx, this.devicePixelRatio, __assign(__assign({}, this.props.geometries), { theme: this.props.geometries.theme }), this.props.background, this.props.elementSizes, this.props.debug);
        }
    };
    Component.prototype.render = function () {
        var _a = this.props, initialized = _a.initialized, _b = _a.chartContainerDimensions, width = _b.width, height = _b.height, forwardStageRef = _a.forwardStageRef, a11ySettings = _a.a11ySettings;
        if (!initialized || width === 0 || height === 0) {
            return null;
        }
        return (react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
            react_1.default.createElement("canvas", { ref: forwardStageRef, className: "echCanvasRenderer", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, style: {
                    width: width,
                    height: height,
                }, role: "presentation" },
                react_1.default.createElement(accessibility_1.ScreenReaderSummary, null))));
    };
    Component.displayName = 'Heatmap';
    return Component;
}(react_1.default.Component));
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onChartRendered: chart_1.onChartRendered,
    }, dispatch);
};
var DEFAULT_PROPS = {
    initialized: false,
    geometries: (0, viewmodel_types_1.nullShapeViewModel)(),
    chartContainerDimensions: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    background: colors_1.Colors.Transparent.keyword,
    elementSizes: {
        grid: { width: 0, height: 0, left: 0, top: 0 },
        xAxis: { width: 0, height: 0, left: 0, top: 0 },
        yAxis: { width: 0, height: 0, left: 0, top: 0 },
        fullHeatmapHeight: 0,
        rowHeight: 0,
        visibleNumberOfRows: 0,
        xAxisTickCadence: 1,
        xLabelRotation: 0,
    },
    debug: false,
};
var mapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    return {
        initialized: true,
        geometries: (0, geometries_1.getHeatmapGeometries)(state),
        chartContainerDimensions: (0, get_heatmap_container_size_1.getHeatmapContainerSizeSelector)(state),
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        background: (0, get_chart_theme_1.getChartThemeSelector)(state).background.color,
        elementSizes: (0, compute_chart_dimensions_1.computeChartElementSizesSelector)(state),
        debug: (0, get_settings_spec_1.getSettingsSpecSelector)(state).debug,
    };
};
exports.Heatmap = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(Component);
//# sourceMappingURL=connected_component.js.map