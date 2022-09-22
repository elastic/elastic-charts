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
exports.BrushTool = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var rect_1 = require("../../chart_types/xy_chart/renderer/canvas/primitives/rect");
var colors_1 = require("../../common/colors");
var canvas_1 = require("../../renderers/canvas");
var get_internal_brush_area_1 = require("../../state/selectors/get_internal_brush_area");
var get_internal_is_brushing_1 = require("../../state/selectors/get_internal_is_brushing");
var get_internal_is_brushing_available_1 = require("../../state/selectors/get_internal_is_brushing_available");
var get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
var get_internal_main_projection_area_1 = require("../../state/selectors/get_internal_main_projection_area");
var get_internal_projection_container_area_1 = require("../../state/selectors/get_internal_projection_container_area");
var DEFAULT_FILL_COLOR = [128, 128, 128, 0.6];
var BrushToolComponent = (function (_super) {
    __extends(BrushToolComponent, _super);
    function BrushToolComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.drawCanvas = function () {
            var _a = _this.props, brushEvent = _a.brushEvent, mainProjectionArea = _a.mainProjectionArea;
            var ctx = _this.ctx;
            if (!ctx || !brushEvent) {
                return;
            }
            var top = brushEvent.top, left = brushEvent.left, width = brushEvent.width, height = brushEvent.height;
            (0, canvas_1.withContext)(ctx, function () {
                ctx.scale(_this.devicePixelRatio, _this.devicePixelRatio);
                (0, canvas_1.withClip)(ctx, {
                    x: mainProjectionArea.left,
                    y: mainProjectionArea.top,
                    width: mainProjectionArea.width,
                    height: mainProjectionArea.height,
                }, function () {
                    (0, canvas_1.clearCanvas)(ctx, colors_1.Colors.Transparent.keyword);
                    ctx.translate(mainProjectionArea.left, mainProjectionArea.top);
                    (0, rect_1.renderRect)(ctx, { x: left, y: top, width: width, height: height }, { color: DEFAULT_FILL_COLOR }, { width: 0, color: colors_1.Colors.Transparent.rgba });
                });
            });
        };
        _this.ctx = null;
        _this.devicePixelRatio = window.devicePixelRatio;
        _this.canvasRef = react_1.default.createRef();
        return _this;
    }
    BrushToolComponent.prototype.componentDidMount = function () {
        this.tryCanvasContext();
        this.drawCanvas();
    };
    BrushToolComponent.prototype.componentDidUpdate = function () {
        if (!this.ctx) {
            this.tryCanvasContext();
        }
        if (this.props.initialized) {
            this.drawCanvas();
        }
    };
    BrushToolComponent.prototype.render = function () {
        var _a = this.props, initialized = _a.initialized, isBrushAvailable = _a.isBrushAvailable, isBrushing = _a.isBrushing, projectionContainer = _a.projectionContainer, zIndex = _a.zIndex;
        if (!initialized || !isBrushAvailable || !isBrushing) {
            this.ctx = null;
            return null;
        }
        var width = projectionContainer.width, height = projectionContainer.height;
        return (react_1.default.createElement("canvas", { ref: this.canvasRef, className: "echBrushTool", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, style: {
                width: width,
                height: height,
                zIndex: zIndex,
            } }));
    };
    BrushToolComponent.prototype.tryCanvasContext = function () {
        var canvas = this.canvasRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    };
    BrushToolComponent.displayName = 'BrushTool';
    return BrushToolComponent;
}(react_1.default.Component));
var mapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            initialized: false,
            projectionContainer: {
                width: 0,
                height: 0,
                left: 0,
                top: 0,
            },
            mainProjectionArea: {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            },
            isBrushing: false,
            isBrushAvailable: false,
            brushEvent: null,
            zIndex: 0,
        };
    }
    return {
        initialized: state.specsInitialized,
        projectionContainer: (0, get_internal_projection_container_area_1.getInternalProjectionContainerAreaSelector)(state),
        mainProjectionArea: (0, get_internal_main_projection_area_1.getInternalMainProjectionAreaSelector)(state),
        isBrushAvailable: (0, get_internal_is_brushing_available_1.getInternalIsBrushingAvailableSelector)(state),
        isBrushing: (0, get_internal_is_brushing_1.getInternalIsBrushingSelector)(state),
        brushEvent: (0, get_internal_brush_area_1.getInternalBrushAreaSelector)(state),
        zIndex: state.zIndex,
    };
};
exports.BrushTool = (0, react_redux_1.connect)(mapStateToProps)(BrushToolComponent);
//# sourceMappingURL=brush.js.map