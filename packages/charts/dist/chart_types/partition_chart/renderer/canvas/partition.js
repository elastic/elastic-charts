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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partition = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var colors_1 = require("../../../../common/colors");
var accessibility_1 = require("../../../../components/accessibility");
var canvas_1 = require("../../../../renderers/canvas");
var chart_1 = require("../../../../state/actions/chart");
var get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
var get_chart_container_dimensions_1 = require("../../../../state/selectors/get_chart_container_dimensions");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var config_1 = require("../../layout/config");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var group_by_rollup_1 = require("../../layout/utils/group_by_rollup");
var viewmodel_1 = require("../../layout/viewmodel/viewmodel");
var geometries_1 = require("../../state/selectors/geometries");
var canvas_linear_renderers_1 = require("./canvas_linear_renderers");
var canvas_renderers_1 = require("./canvas_renderers");
var canvas_wrapped_renderers_1 = require("./canvas_wrapped_renderers");
var PartitionComponent = (function (_super) {
    __extends(PartitionComponent, _super);
    function PartitionComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.ctx = null;
        _this.devicePixelRatio = window.devicePixelRatio;
        _this.animationState = { rafId: NaN };
        return _this;
    }
    PartitionComponent.prototype.componentDidMount = function () {
        this.tryCanvasContext();
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    };
    PartitionComponent.prototype.componentDidUpdate = function () {
        if (!this.ctx) {
            this.tryCanvasContext();
        }
        if (this.props.initialized) {
            this.drawCanvas();
            this.props.onChartRendered();
        }
    };
    PartitionComponent.prototype.handleMouseMove = function (e) {
        var _a = this.props, initialized = _a.initialized, _b = _a.chartDimensions, width = _b.width, height = _b.height, forwardStageRef = _a.forwardStageRef;
        if (!forwardStageRef.current || !this.ctx || !initialized || width === 0 || height === 0) {
            return;
        }
        var picker = this.props.geometries.pickQuads;
        var focus = this.props.geometriesFoci[0];
        var box = forwardStageRef.current.getBoundingClientRect();
        var diskCenter = this.props.geometries.diskCenter;
        var x = e.clientX - box.left - diskCenter.x;
        var y = e.clientY - box.top - diskCenter.y;
        var pickedShapes = picker(x, y, focus);
        var datumIndices = new Set();
        pickedShapes.forEach(function (shape) {
            var node = shape[config_1.MODEL_KEY];
            var shapeNode = node.children.find(function (_a) {
                var _b = __read(_a, 1), key = _b[0];
                return key === shape.dataName;
            });
            if (shapeNode) {
                var indices = shapeNode[1][group_by_rollup_1.INPUT_KEY] || [];
                indices.forEach(function (i) { return datumIndices.add(i); });
            }
        });
        return pickedShapes;
    };
    PartitionComponent.prototype.render = function () {
        var _a = this.props, forwardStageRef = _a.forwardStageRef, initialized = _a.initialized, _b = _a.chartDimensions, width = _b.width, height = _b.height, a11ySettings = _a.a11ySettings, debug = _a.debug, isRTL = _a.isRTL;
        return width === 0 || height === 0 || !initialized ? null : (react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
            react_1.default.createElement("canvas", { dir: isRTL ? 'rtl' : 'ltr', ref: forwardStageRef, className: "echCanvasRenderer", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, onMouseMove: this.handleMouseMove.bind(this), style: {
                    width: width,
                    height: height,
                }, role: "presentation" },
                react_1.default.createElement(accessibility_1.ScreenReaderSummary, null),
                !debug && react_1.default.createElement(accessibility_1.ScreenReaderPartitionTable, null)),
            debug && react_1.default.createElement(accessibility_1.ScreenReaderPartitionTable, null)));
    };
    PartitionComponent.prototype.drawCanvas = function () {
        var _this = this;
        if (this.ctx) {
            var _a = this, ctx_1 = _a.ctx, devicePixelRatio_1 = _a.devicePixelRatio, props_1 = _a.props;
            (0, canvas_1.clearCanvas)(ctx_1, props_1.background);
            props_1.multiGeometries.forEach(function (geometries, geometryIndex) {
                var renderer = (0, viewmodel_1.isSimpleLinear)(geometries.layout, geometries.style.fillLabel, geometries.layers)
                    ? canvas_linear_renderers_1.renderLinearPartitionCanvas2d
                    : (0, viewmodel_1.isWaffle)(geometries.layout)
                        ? canvas_wrapped_renderers_1.renderWrappedPartitionCanvas2d
                        : canvas_renderers_1.renderPartitionCanvas2d;
                renderer(ctx_1, devicePixelRatio_1, geometries, props_1.geometriesFoci[geometryIndex], _this.animationState);
            });
        }
    };
    PartitionComponent.prototype.tryCanvasContext = function () {
        var canvas = this.props.forwardStageRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    };
    PartitionComponent.displayName = 'Partition';
    return PartitionComponent;
}(react_1.default.Component));
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({ onChartRendered: chart_1.onChartRendered }, dispatch);
};
var DEFAULT_PROPS = {
    isRTL: false,
    initialized: false,
    geometries: (0, viewmodel_types_1.nullShapeViewModel)(),
    geometriesFoci: [],
    multiGeometries: [],
    chartDimensions: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    },
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    debug: false,
    background: colors_1.Colors.Transparent.keyword,
};
var mapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    var multiGeometries = (0, geometries_1.partitionMultiGeometries)(state);
    return {
        isRTL: (0, viewmodel_types_1.hasMostlyRTLLabels)(multiGeometries),
        initialized: true,
        geometries: multiGeometries.length > 0 ? multiGeometries[0] : (0, viewmodel_types_1.nullShapeViewModel)(),
        multiGeometries: multiGeometries,
        chartDimensions: (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state),
        geometriesFoci: (0, geometries_1.partitionDrilldownFocus)(state),
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        debug: (0, get_settings_spec_1.getSettingsSpecSelector)(state).debug,
        background: (0, get_chart_theme_1.getChartThemeSelector)(state).background.color,
    };
};
exports.Partition = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(PartitionComponent);
//# sourceMappingURL=partition.js.map