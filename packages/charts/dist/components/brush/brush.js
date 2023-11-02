"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrushTool = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const rect_1 = require("../../chart_types/xy_chart/renderer/canvas/primitives/rect");
const colors_1 = require("../../common/colors");
const canvas_1 = require("../../renderers/canvas");
const get_internal_brush_area_1 = require("../../state/selectors/get_internal_brush_area");
const get_internal_is_brushing_1 = require("../../state/selectors/get_internal_is_brushing");
const get_internal_is_brushing_available_1 = require("../../state/selectors/get_internal_is_brushing_available");
const get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
const get_internal_main_projection_area_1 = require("../../state/selectors/get_internal_main_projection_area");
const get_internal_projection_container_area_1 = require("../../state/selectors/get_internal_projection_container_area");
const DEFAULT_FILL_COLOR = [128, 128, 128, 0.6];
class BrushToolComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.drawCanvas = () => {
            const { brushEvent, mainProjectionArea } = this.props;
            const { ctx } = this;
            if (!ctx || !brushEvent) {
                return;
            }
            const { top, left, width, height } = brushEvent;
            (0, canvas_1.withContext)(ctx, () => {
                ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
                (0, canvas_1.withClip)(ctx, {
                    x: mainProjectionArea.left,
                    y: mainProjectionArea.top,
                    width: mainProjectionArea.width,
                    height: mainProjectionArea.height,
                }, () => {
                    (0, canvas_1.clearCanvas)(ctx, colors_1.Colors.Transparent.keyword);
                    ctx.translate(mainProjectionArea.left, mainProjectionArea.top);
                    (0, rect_1.renderRect)(ctx, { x: left, y: top, width, height }, { color: DEFAULT_FILL_COLOR }, { width: 0, color: colors_1.Colors.Transparent.rgba });
                });
            });
        };
        this.ctx = null;
        this.devicePixelRatio = window.devicePixelRatio;
        this.canvasRef = react_1.default.createRef();
    }
    componentDidMount() {
        this.tryCanvasContext();
        this.drawCanvas();
    }
    componentDidUpdate() {
        if (!this.ctx) {
            this.tryCanvasContext();
        }
        if (this.props.initialized) {
            this.drawCanvas();
        }
    }
    render() {
        const { initialized, isBrushAvailable, isBrushing, projectionContainer, zIndex } = this.props;
        if (!initialized || !isBrushAvailable || !isBrushing) {
            this.ctx = null;
            return null;
        }
        const { width, height } = projectionContainer;
        return (react_1.default.createElement("canvas", { ref: this.canvasRef, className: "echBrushTool", width: width * this.devicePixelRatio, height: height * this.devicePixelRatio, style: {
                width,
                height,
                zIndex,
            } }));
    }
    tryCanvasContext() {
        const canvas = this.canvasRef.current;
        this.ctx = canvas && canvas.getContext('2d');
    }
}
BrushToolComponent.displayName = 'BrushTool';
const mapStateToProps = (state) => {
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