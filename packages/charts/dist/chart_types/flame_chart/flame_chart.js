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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlameWithTooltip = void 0;
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const navigation_1 = require("./navigation");
const common_1 = require("./render/common");
const draw_a_frame_1 = require("./render/draw_a_frame");
const ensure_webgl_1 = require("./render/ensure_webgl");
const upload_to_webgl_1 = require("./render/upload_to_webgl");
const shaders_1 = require("./shaders");
const types_1 = require("./types");
const __1 = require("..");
const constants_1 = require("../../common/constants");
const kingly_1 = require("../../common/kingly");
const webgl_constants_1 = require("../../common/webgl_constants");
const tooltip_1 = require("../../components/tooltip/tooltip");
const specs_1 = require("../../specs");
const chart_1 = require("../../state/actions/chart");
const mouse_1 = require("../../state/actions/mouse");
const can_pin_tooltip_1 = require("../../state/selectors/can_pin_tooltip");
const get_accessibility_config_1 = require("../../state/selectors/get_accessibility_config");
const get_chart_theme_1 = require("../../state/selectors/get_chart_theme");
const get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
const get_tooltip_spec_1 = require("../../state/selectors/get_tooltip_spec");
const utils_1 = require("../../state/utils");
const common_2 = require("../../utils/common");
const PINCH_ZOOM_CHECK_INTERVAL_MS = 100;
const SIDE_OVERSHOOT_RATIO = 0.05;
const RECURRENCE_ALPHA_PER_MS_X = 0.01;
const RECURRENCE_ALPHA_PER_MS_Y = 0.0062;
const SINGLE_CLICK_EMPTY_FOCUS = true;
const IS_META_REQUIRED_FOR_ZOOM = false;
const ZOOM_SPEED = 0.0015;
const DEEPEST_ZOOM_RATIO = 1e-7;
const ZOOM_FROM_EDGE_BAND = 16;
const ZOOM_FROM_EDGE_BAND_LEFT = ZOOM_FROM_EDGE_BAND + draw_a_frame_1.PADDING_LEFT;
const ZOOM_FROM_EDGE_BAND_RIGHT = ZOOM_FROM_EDGE_BAND + draw_a_frame_1.PADDING_RIGHT;
const ZOOM_FROM_EDGE_BAND_TOP = ZOOM_FROM_EDGE_BAND + draw_a_frame_1.PADDING_TOP;
const ZOOM_FROM_EDGE_BAND_BOTTOM = ZOOM_FROM_EDGE_BAND + draw_a_frame_1.PADDING_BOTTOM;
const LEFT_MOUSE_BUTTON = 1;
const MINIMAP_SIZE_RATIO_X = 3;
const MINIMAP_SIZE_RATIO_Y = 3;
const SHOWN_ANCESTOR_COUNT = 2;
const SHOULD_DISABLE_WOBBLE = (typeof process === 'object' && process.env && process.env.VRT) === 'true';
const WOBBLE_DURATION = SHOULD_DISABLE_WOBBLE ? 0 : 1000;
const WOBBLE_REPEAT_COUNT = 2;
const WOBBLE_FREQUENCY = SHOULD_DISABLE_WOBBLE ? 0 : 2 * Math.PI * (WOBBLE_REPEAT_COUNT / WOBBLE_DURATION);
const NODE_TWEEN_DURATION_MS = 500;
const unitRowPitch = (position) => { var _a, _b; return (position.length >= 4 ? ((_a = position[1]) !== null && _a !== void 0 ? _a : 0) - ((_b = position[3]) !== null && _b !== void 0 ? _b : 0) : 1); };
const initialPixelRowPitch = () => 16;
const specValueFormatter = (d) => d;
const browserRootWindow = () => {
    let rootWindow = window;
    while (window.parent && window.parent.window !== rootWindow)
        rootWindow = rootWindow.parent.window;
    return rootWindow;
};
const columnToRowPositions = ({ position1, size1 }, i) => {
    var _a, _b, _c, _d, _e;
    return ({
        x0: (_a = position1[i * 2]) !== null && _a !== void 0 ? _a : 0,
        x1: ((_b = position1[i * 2]) !== null && _b !== void 0 ? _b : 0) + ((_c = size1[i]) !== null && _c !== void 0 ? _c : 0),
        y0: (_d = position1[i * 2 + 1]) !== null && _d !== void 0 ? _d : 0,
        y1: ((_e = position1[i * 2 + 1]) !== null && _e !== void 0 ? _e : 0) + unitRowPitch(position1),
    });
};
const focusForArea = (chartHeight, { x0, x1, y0, y1 }) => {
    const sideOvershoot = SIDE_OVERSHOOT_RATIO * (x1 - x0);
    const unitRowHeight = y1 - y0;
    const chartHeightInUnit = (chartHeight / initialPixelRowPitch()) * unitRowHeight;
    const y = Math.min(1, y1 + unitRowHeight * SHOWN_ANCESTOR_COUNT);
    const intendedY0 = y - chartHeightInUnit;
    const bottomOvershoot = Math.max(0, -intendedY0);
    const top = Math.min(1, y + bottomOvershoot);
    return {
        x0: Math.max(0, x0 - sideOvershoot),
        x1: Math.min(1, x1 + sideOvershoot),
        y0: Math.max(0, intendedY0),
        y1: Math.min(1, top),
    };
};
const focusRect = (columnarViewModel, chartHeight, drilldownDatumIndex) => focusForArea(chartHeight, columnToRowPositions(columnarViewModel, drilldownDatumIndex || 0));
const getColor = (c, i) => {
    var _a, _b, _c;
    const r = Math.round(255 * ((_a = c[4 * i]) !== null && _a !== void 0 ? _a : 0));
    const g = Math.round(255 * ((_b = c[4 * i + 1]) !== null && _b !== void 0 ? _b : 0));
    const b = Math.round(255 * ((_c = c[4 * i + 2]) !== null && _c !== void 0 ? _c : 0));
    const a = c[4 * i + 3];
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const colorToDatumIndex = (pixel) => {
    const [p0 = 0, p1 = 0, p2 = 0, p3 = 0] = pixel;
    const isEmptyArea = p0 + p1 + p2 + p3 < shaders_1.GEOM_INDEX_OFFSET;
    return isEmptyArea ? NaN : p3 + 256 * (p2 + 256 * (p1 + 256 * p0)) - shaders_1.GEOM_INDEX_OFFSET;
};
const getRegExp = (searchString) => {
    let regex;
    try {
        regex = new RegExp(searchString);
    }
    catch {
        return new RegExp('iIUiUYIuiGjhG678987gjhgfytr678576');
    }
    return regex;
};
const isAttributeKey = (keyCandidate) => keyCandidate in shaders_1.attributeLocations;
class FlameComponent extends react_1.default.Component {
    constructor(props) {
        var _a, _b;
        super(props);
        this.ctx = null;
        this.glContext = null;
        this.pickTexture = kingly_1.NullTexture;
        this.glResources = types_1.NULL_GL_RESOURCES;
        this.glCanvasRef = (0, react_1.createRef)();
        this.pinchZoomSetInterval = NaN;
        this.pointerX = NaN;
        this.pointerY = NaN;
        this.pinnedPointerX = NaN;
        this.pinnedPointerY = NaN;
        this.tooltipPinned = false;
        this.tooltipSelectedSeries = [];
        this.hoverIndex = NaN;
        this.tooltipValues = [];
        this.animationRafId = NaN;
        this.prevFocusTime = NaN;
        this.prevNodeTweenTime = NaN;
        this.startOfDragX = NaN;
        this.startOfDragY = NaN;
        this.startOfDragFocusLeft = NaN;
        this.startOfDragFocusTop = NaN;
        this.searchInputRef = (0, react_1.createRef)();
        this.currentSearchString = '';
        this.currentSearchHitCount = 0;
        this.caseSensitive = false;
        this.useRegex = false;
        this.focusedMatchIndex = NaN;
        this.wobbleTimeLeft = 0;
        this.wobbleIndex = NaN;
        this.pinTooltip = (pinned) => {
            if (!pinned) {
                this.unpinTooltip(true);
                return;
            }
            this.tooltipPinned = true;
            this.tooltipSelectedSeries = this.tooltipValues;
        };
        this.toggleSelectedTooltipItem = (tooltipValue) => {
            if (!this.tooltipPinned)
                return;
            this.tooltipSelectedSeries = this.tooltipSelectedSeries.length === 0 ? [tooltipValue] : [];
            this.setState({});
        };
        this.setSelectedTooltipItems = (tooltipValues) => {
            this.tooltipSelectedSeries = tooltipValues;
            this.setState({});
        };
        this.setupDevicePixelRatioChangeListener = () => {
            window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener('change', () => {
                this.setState({});
                this.setupDevicePixelRatioChangeListener();
            }, { once: true });
        };
        this.setupViewportScaleChangeListener = () => {
            window.clearInterval(this.pinchZoomSetInterval);
            this.pinchZoomSetInterval = window.setInterval(() => {
                var _a, _b;
                const pinchZoomScale = (_b = (_a = browserRootWindow().visualViewport) === null || _a === void 0 ? void 0 : _a.scale) !== null && _b !== void 0 ? _b : 1;
                if (pinchZoomScale !== this.pinchZoomScale) {
                    this.pinchZoomScale = pinchZoomScale;
                    this.setState({});
                }
            }, PINCH_ZOOM_CHECK_INTERVAL_MS);
        };
        this.componentDidMount = () => {
            var _a;
            this.tryCanvasContext();
            if (this.props.search.text.length > 0 && this.searchInputRef.current) {
                this.searchInputRef.current.value = this.props.search.text;
                this.searchForText(false);
            }
            this.drawCanvas();
            this.props.onChartRendered();
            this.setupDevicePixelRatioChangeListener();
            (_a = this.props.containerRef().current) === null || _a === void 0 ? void 0 : _a.addEventListener('wheel', this.preventScroll, { passive: false });
        };
        this.ensureTextureAndDraw = () => {
            this.ensurePickTexture();
            this.drawCanvas();
        };
        this.componentDidUpdate = ({ chartDimensions, search }) => {
            if (!this.ctx)
                this.tryCanvasContext();
            if (this.tooltipPinned && this.chartDimensionsChanged(chartDimensions)) {
                this.unpinTooltip();
            }
            this.bindControls();
            if (search.text !== this.props.search.text && this.searchInputRef.current) {
                this.searchInputRef.current.value = this.props.search.text;
                this.searchForText(false);
            }
            this.ensureTextureAndDraw();
        };
        this.pointerInMinimap = (x, y) => x === (0, common_2.clamp)(x, this.getMinimapLeft(), this.getMinimapLeft() + this.getMinimapWidth()) &&
            y === (0, common_2.clamp)(y, this.getMinimapTop(), this.getMinimapTop() + this.getMinimapHeight());
        this.datumAtXY = (x, y) => this.glContext ? colorToDatumIndex((0, kingly_1.readPixel)(this.glContext, x, y)) : NaN;
        this.getHoveredDatumIndex = () => {
            const pr = window.devicePixelRatio * this.pinchZoomScale;
            const x = this.tooltipPinned ? this.pinnedPointerX : this.pointerX;
            const y = this.tooltipPinned ? this.pinnedPointerY : this.pointerY;
            return this.datumAtXY(pr * x, pr * (this.props.chartDimensions.height - y));
        };
        this.getDragDistanceX = () => this.pointerX - this.startOfDragX;
        this.getDragDistanceY = () => -(this.pointerY - this.startOfDragY);
        this.isDragging = ({ buttons }) => buttons & LEFT_MOUSE_BUTTON;
        this.handleMouseHoverMove = (e) => {
            if (!this.isDragging(e)) {
                e.stopPropagation();
                this.updatePointerLocation(e);
                if (!this.tooltipPinned) {
                    this.updateHoverIndex();
                }
            }
        };
        this.handleMouseDragMove = (e) => {
            e.stopPropagation();
            this.updatePointerLocation(e);
            if (this.isDragging(e)) {
                const dragInMinimap = this.pointerInMinimap(this.startOfDragX, this.startOfDragY);
                const focusMoveDirection = dragInMinimap ? 1 : -1;
                const { x0, x1, y0, y1 } = this.currentFocus;
                const focusWidth = x1 - x0;
                const focusHeight = y1 - y0;
                if (Number.isNaN(this.startOfDragFocusLeft))
                    this.startOfDragFocusLeft = x0;
                if (Number.isNaN(this.startOfDragFocusTop))
                    this.startOfDragFocusTop = y0;
                const dragDistanceX = this.getDragDistanceX();
                const dragDistanceY = this.getDragDistanceY();
                const { width: chartWidth, height: chartHeight } = this.props.chartDimensions;
                const focusChartWidth = chartWidth - draw_a_frame_1.PADDING_LEFT - draw_a_frame_1.PADDING_RIGHT;
                const focusChartHeight = chartHeight - draw_a_frame_1.PADDING_TOP - draw_a_frame_1.PADDING_BOTTOM;
                const dragSpeedX = (dragInMinimap ? MINIMAP_SIZE_RATIO_X / focusWidth : 1) / focusChartWidth;
                const dragSpeedY = (dragInMinimap ? MINIMAP_SIZE_RATIO_Y / focusHeight : 1) / focusChartHeight;
                const deltaIntentX = focusMoveDirection * dragDistanceX * dragSpeedX * focusWidth;
                const deltaIntentY = focusMoveDirection * dragDistanceY * dragSpeedY * focusHeight;
                const deltaCorrectionX = deltaIntentX > 0
                    ? Math.min(0, 1 - (this.startOfDragFocusLeft + focusWidth + deltaIntentX))
                    : -Math.min(0, this.startOfDragFocusLeft + deltaIntentX);
                const deltaCorrectionY = deltaIntentY > 0
                    ? Math.min(0, 1 - (this.startOfDragFocusTop + focusHeight + deltaIntentY))
                    : -Math.min(0, this.startOfDragFocusTop + deltaIntentY);
                const deltaX = deltaIntentX + deltaCorrectionX;
                const deltaY = deltaIntentY + deltaCorrectionY;
                const newX0 = (0, common_2.clamp)(this.startOfDragFocusLeft + deltaX, 0, 1);
                const newX1 = (0, common_2.clamp)(this.startOfDragFocusLeft + focusWidth + deltaX, 0, 1);
                const newY0 = (0, common_2.clamp)(this.startOfDragFocusTop + deltaY, 0, 1);
                const newY1 = (0, common_2.clamp)(this.startOfDragFocusTop + focusHeight + deltaY, 0, 1);
                const newFocus = { x0: newX0, x1: newX1, y0: newY0, y1: newY1 };
                this.currentFocus = newFocus;
                this.targetFocus = newFocus;
                this.navigator.add({ ...newFocus, index: NaN });
                this.smartDraw();
            }
        };
        this.clearDrag = () => {
            this.startOfDragX = NaN;
            this.startOfDragY = NaN;
            this.startOfDragFocusLeft = NaN;
            this.startOfDragFocusTop = NaN;
        };
        this.resetDrag = () => {
            this.startOfDragX = this.pointerX;
            this.startOfDragY = this.pointerY;
        };
        this.handleMouseDown = (e) => {
            e.stopPropagation();
            if (e.button === constants_1.SECONDARY_BUTTON || e.ctrlKey)
                return;
            if (Number.isNaN(this.pointerX + this.pointerY))
                return;
            if (this.tooltipPinned)
                return;
            this.resetDrag();
            window.addEventListener('mousemove', this.handleMouseDragMove, { passive: true });
            window.addEventListener('mouseup', this.handleMouseUp, { passive: true });
        };
        this.handleContextMenu = (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (this.tooltipPinned) {
                this.handleUnpinningTooltip();
                return;
            }
            if (!Number.isFinite(this.getHoveredDatumIndex())) {
                return;
            }
            window.addEventListener('keyup', this.handleKeyUp);
            window.addEventListener('click', this.handleUnpinningTooltip);
            window.addEventListener('visibilitychange', this.handleUnpinningTooltip);
            this.pinTooltip(true);
            this.setState({});
        };
        this.handleMouseUp = (e) => {
            e.stopPropagation();
            window.removeEventListener('mousemove', this.handleMouseDragMove);
            window.removeEventListener('mouseup', this.handleMouseUp);
            if (this.tooltipPinned) {
                this.unpinTooltip();
                this.clearDrag();
                return;
            }
            this.updatePointerLocation(e);
            const dragDistanceX = this.getDragDistanceX();
            const dragDistanceY = this.getDragDistanceY();
            if (!dragDistanceX && !dragDistanceY) {
                const hoveredDatumIndex = this.getHoveredDatumIndex();
                const isDoubleClick = e.detail > 1;
                const hasClickedOnRectangle = Number.isFinite(hoveredDatumIndex);
                const mustFocus = SINGLE_CLICK_EMPTY_FOCUS || isDoubleClick !== hasClickedOnRectangle;
                const isContextClick = e.button === constants_1.SECONDARY_BUTTON || e.ctrlKey;
                if (mustFocus && !isContextClick && !this.pointerInMinimap(this.pointerX, this.pointerY)) {
                    const rect = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, hoveredDatumIndex);
                    this.navigator.add({ ...rect, index: hoveredDatumIndex });
                    this.focusOnNode(hoveredDatumIndex);
                    this.props.onElementClick([{ vmIndex: hoveredDatumIndex }]);
                }
            }
            this.clearDrag();
            this.setState({});
        };
        this.handleUnpinningTooltip = () => {
            window.removeEventListener('keyup', this.handleKeyUp);
            window.removeEventListener('click', this.handleUnpinningTooltip);
            window.removeEventListener('visibilitychange', this.handleUnpinningTooltip);
            this.pinTooltip(false);
        };
        this.handleKeyUp = ({ key }) => {
            if (!FlameComponent.watchedKeys.includes(key))
                return;
            window.removeEventListener('keyup', this.handleKeyUp);
            this.unpinTooltip();
        };
        this.handleMouseLeave = (e) => {
            e.stopPropagation();
            if (!this.tooltipPinned) {
                this.smartDraw();
            }
        };
        this.preventScroll = (e) => e.metaKey === IS_META_REQUIRED_FOR_ZOOM && e.preventDefault();
        this.handleWheel = (e) => {
            if (e.metaKey !== IS_META_REQUIRED_FOR_ZOOM)
                return;
            this.unpinTooltip();
            this.updatePointerLocation(e);
            const { x0, x1, y0, y1 } = this.currentFocus;
            const wheelDelta = -e.deltaY;
            const delta = wheelDelta * ZOOM_SPEED;
            const unitX = this.pointerX / this.props.chartDimensions.width;
            const unitY = (this.props.chartDimensions.height - this.pointerY) / this.props.chartDimensions.height;
            const zoomOut = delta <= 0;
            const midX = Math.abs(x0) < draw_a_frame_1.EPSILON && (zoomOut || this.pointerX < ZOOM_FROM_EDGE_BAND_LEFT)
                ? 0
                : Math.abs(x1 - 1) < draw_a_frame_1.EPSILON &&
                    (zoomOut || this.pointerX > this.props.chartDimensions.width - ZOOM_FROM_EDGE_BAND_RIGHT)
                    ? 1
                    : (0, common_2.clamp)(x0 + unitX * Math.abs(x1 - x0), 0, 1);
            const midY = Math.abs(y0) < draw_a_frame_1.EPSILON &&
                (zoomOut || this.pointerY > this.props.chartDimensions.height - ZOOM_FROM_EDGE_BAND_BOTTOM)
                ? 0
                : Math.abs(y1 - 1) < draw_a_frame_1.EPSILON && (zoomOut || this.pointerY < ZOOM_FROM_EDGE_BAND_TOP)
                    ? 1
                    : (0, common_2.clamp)(y0 + unitY * Math.abs(y1 - y0), 0, 1);
            const targetX0 = (0, common_2.clamp)(x0 - delta * (x0 - midX), 0, 1);
            const targetX1 = (0, common_2.clamp)(x1 + delta * (midX - x1), 0, 1);
            const targetY0 = (0, common_2.clamp)(y0 - delta * (y0 - midY), 0, 1);
            const targetY1 = (0, common_2.clamp)(y1 + delta * (midY - y1), 0, 1);
            const newX0 = Math.min(targetX0, midX);
            const newX1 = Math.max(targetX1, midX);
            const newY0 = Math.min(targetY0, midY);
            const newY1 = Math.max(targetY1, midY);
            const xZoom = (e.ctrlKey || !e.altKey) && newX1 - newX0 >= DEEPEST_ZOOM_RATIO;
            const yZoom = (e.ctrlKey || e.altKey) && newY1 - newY0 >= unitRowPitch(this.props.columnarViewModel.position1);
            if (xZoom || yZoom) {
                const newFocus = {
                    x0: xZoom ? newX0 : x0,
                    x1: xZoom ? newX1 : x1,
                    y0: yZoom ? newY0 : y0,
                    y1: yZoom ? newY1 : y1,
                };
                this.navigator.add({ ...newFocus, index: NaN });
                this.currentFocus = newFocus;
                this.targetFocus = newFocus;
            }
            this.smartDraw();
        };
        this.focusOnAllMatches = () => {
            var _a, _b, _c, _d, _e, _f;
            this.currentSearchHitCount = 0;
            const searchString = this.currentSearchString;
            const customizedSearchString = this.caseSensitive ? searchString : searchString.toLowerCase();
            const regex = this.useRegex && getRegExp(searchString);
            const columns = this.props.columnarViewModel;
            this.currentColor = new Float32Array(columns.color);
            const labels = columns.label;
            const size = columns.size1;
            const position = columns.position1;
            const rowHeight = unitRowPitch(position);
            const datumCount = labels.length;
            let x0 = Infinity;
            let x1 = -Infinity;
            let y0 = Infinity;
            let y1 = -Infinity;
            for (let i = 0; i < datumCount; i++) {
                const label = this.caseSensitive ? labels[i] : (_a = labels[i]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (regex ? label === null || label === void 0 ? void 0 : label.match(regex) : label === null || label === void 0 ? void 0 : label.includes(customizedSearchString)) {
                    this.currentSearchHitCount++;
                    x0 = Math.min(x0, (_b = position[2 * i]) !== null && _b !== void 0 ? _b : 0);
                    x1 = Math.max(x1, ((_c = position[2 * i]) !== null && _c !== void 0 ? _c : 0) + ((_d = size[i]) !== null && _d !== void 0 ? _d : 0));
                    y0 = Math.min(y0, (_e = position[2 * i + 1]) !== null && _e !== void 0 ? _e : 0);
                    y1 = Math.max(y1, ((_f = position[2 * i + 1]) !== null && _f !== void 0 ? _f : 0) + rowHeight);
                }
                else {
                    this.currentColor[4 * i + 3] *= 0.25;
                }
            }
            if (Number.isFinite(x0) && searchString.length > 0) {
                Object.assign(this.targetFocus, focusForArea(this.props.chartDimensions.height, { x0, x1, y0, y1 }));
            }
        };
        this.uploadSearchColors = () => {
            const colorSetter = this.glResources.attributes.get('color');
            if (this.glContext && colorSetter && this.currentColor.length === this.props.columnarViewModel.color.length) {
                (0, upload_to_webgl_1.uploadToWebgl)(this.glContext, new Map([['color', colorSetter]]), { color: this.currentColor });
            }
        };
        this.searchForText = (force) => {
            const input = this.searchInputRef.current;
            const searchString = input === null || input === void 0 ? void 0 : input.value;
            if (!input || typeof searchString !== 'string' || (searchString === this.currentSearchString && !force))
                return;
            this.currentSearchString = searchString;
            this.focusOnAllMatches();
            this.uploadSearchColors();
            this.focusedMatchIndex = NaN;
            this.setState({});
        };
        this.handleEnterKey = (e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    this.previousHit();
                }
                else {
                    this.nextHit();
                }
                return true;
            }
            return false;
        };
        this.clearSearchText = () => {
            if (!this.searchInputRef.current)
                return;
            this.searchInputRef.current.value = '';
            this.searchForText(false);
        };
        this.handleEscapeKey = (e) => {
            if (e.key === 'Escape') {
                this.clearSearchText();
            }
        };
        this.handleSearchFieldKeyPress = (e) => {
            if (this.handleEnterKey(e)) {
                e.stopPropagation();
            }
        };
        this.focusOnHit = () => {
            var _a;
            if (Number.isNaN(this.focusedMatchIndex)) {
                this.focusOnAllMatches();
            }
            else {
                let datumIndex = NaN;
                let hitEnumerator = -1;
                const searchString = this.currentSearchString;
                const customizedSearchString = this.caseSensitive ? searchString : searchString.toLowerCase();
                const regex = this.useRegex && getRegExp(searchString);
                const labels = this.props.columnarViewModel.label;
                for (let i = 0; i < labels.length; i++) {
                    const label = this.caseSensitive ? labels[i] : (_a = labels[i]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    if (regex ? label === null || label === void 0 ? void 0 : label.match(regex) : label === null || label === void 0 ? void 0 : label.includes(customizedSearchString)) {
                        datumIndex = i;
                        hitEnumerator++;
                        if (hitEnumerator === this.focusedMatchIndex)
                            break;
                    }
                }
                if (hitEnumerator >= 0) {
                    this.targetFocus = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, datumIndex);
                    this.prevFocusTime = NaN;
                    this.hoverIndex = NaN;
                    this.wobbleTimeLeft = WOBBLE_DURATION;
                    this.wobbleIndex = datumIndex;
                }
            }
        };
        this.previousHit = () => {
            const hitCount = this.currentSearchHitCount;
            if (!this.currentSearchString || hitCount === 0)
                return;
            this.focusedMatchIndex = Number.isNaN(this.focusedMatchIndex)
                ? hitCount - 1
                : this.focusedMatchIndex === 0
                    ? NaN
                    : this.focusedMatchIndex - 1;
            this.focusOnHit();
            this.setState({});
        };
        this.nextHit = () => {
            const hitCount = this.currentSearchHitCount;
            if (!this.currentSearchString || hitCount === 0)
                return;
            this.focusedMatchIndex = this.focusedMatchIndex = Number.isNaN(this.focusedMatchIndex)
                ? 0
                : this.focusedMatchIndex === hitCount - 1
                    ? NaN
                    : this.focusedMatchIndex + 1;
            this.focusOnHit();
            this.setState({});
        };
        this.render = () => {
            const { forwardStageRef, chartDimensions: { width: requestedWidth, height: requestedHeight }, a11ySettings, debugHistory, theme, canPinTooltip, } = this.props;
            const width = (0, common_1.roundUpSize)(requestedWidth);
            const height = (0, common_1.roundUpSize)(requestedHeight);
            const style = {
                width,
                height,
                top: 0,
                left: 0,
                padding: 0,
                margin: 0,
                border: 0,
                position: 'absolute',
                cursor: this.getActiveCursor(),
            };
            const dpr = window.devicePixelRatio * this.pinchZoomScale;
            const canvasWidth = width * dpr;
            const canvasHeight = height * dpr;
            const hitCount = this.currentSearchHitCount;
            const { textColor, buttonDisabledTextColor, buttonBackgroundColor, buttonDisabledBackgroundColor, buttonTextColor, } = theme.navigation;
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
                    react_1.default.createElement("canvas", { ref: this.glCanvasRef, className: "echCanvasRenderer", width: canvasWidth, height: canvasHeight, style: style, role: "presentation" }),
                    react_1.default.createElement("canvas", { ref: forwardStageRef, tabIndex: 0, className: "echCanvasRenderer", width: canvasWidth, height: canvasHeight, onMouseMove: this.handleMouseHoverMove, onMouseDown: this.handleMouseDown, onContextMenu: canPinTooltip ? this.handleContextMenu : undefined, onMouseLeave: this.handleMouseLeave, onKeyPress: this.handleEnterKey, onKeyUp: this.handleEscapeKey, onWheel: this.handleWheel, style: { ...style, outline: 'none' }, role: "presentation" })),
                react_1.default.createElement("div", { style: {
                        position: 'absolute',
                        transform: `translateY(${this.props.chartDimensions.height - draw_a_frame_1.PADDING_BOTTOM + 4}px)`,
                    } },
                    react_1.default.createElement("label", { title: "Navigate back", style: {
                            color: this.navigator.canNavBackward() ? buttonTextColor : buttonDisabledTextColor,
                            fontWeight: 500,
                            marginLeft: 16,
                            marginRight: 4,
                            borderRadius: 4,
                            paddingInline: 4,
                            width: 18,
                            display: 'inline-block',
                            height: 16,
                            verticalAlign: 'middle',
                            textAlign: 'center',
                            backgroundColor: this.navigator.canNavBackward() ? buttonBackgroundColor : buttonDisabledBackgroundColor,
                        } },
                        "\u1438",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: () => this.focusOnNavElement(this.navigator.navBackward()), style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Reset", style: {
                            color: buttonTextColor,
                            fontWeight: 500,
                            paddingInline: 4,
                            borderRadius: 4,
                            verticalAlign: 'middle',
                            backgroundColor: buttonBackgroundColor,
                        } },
                        "\u25B2",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: () => this.resetFocus(), style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Navigate forward", style: {
                            color: this.navigator.canNavForward() ? buttonTextColor : buttonDisabledTextColor,
                            fontWeight: 500,
                            marginLeft: 4,
                            marginRight: 16,
                            borderRadius: 4,
                            paddingInline: 4,
                            verticalAlign: 'middle',
                            backgroundColor: this.navigator.canNavForward() ? buttonBackgroundColor : buttonDisabledBackgroundColor,
                        } },
                        "\u1433",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: () => this.focusOnNavElement(this.navigator.navForward()), style: { display: 'none' } })),
                    react_1.default.createElement("input", { ref: this.searchInputRef, title: "Search string or regex pattern", size: 16, type: "text", tabIndex: 0, placeholder: "Search string", onKeyPress: this.handleSearchFieldKeyPress, onKeyUp: this.handleEscapeKey, onChange: (e) => {
                            this.searchForText(false);
                            this.props.onSeachTextChange(e.currentTarget.value);
                        }, style: {
                            border: 'none',
                            padding: 3,
                            outline: 'none',
                            color: textColor,
                            background: 'transparent',
                        } }),
                    react_1.default.createElement("label", { title: "Clear text", style: {
                            color: buttonTextColor,
                            background: buttonBackgroundColor,
                            fontWeight: 500,
                            paddingInline: 4,
                            marginInline: 4,
                            borderRadius: 4,
                            opacity: this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } },
                        "Clear",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: () => {
                                if (this.currentSearchString && this.searchInputRef.current) {
                                    this.clearSearchText();
                                    this.props.onSeachTextChange('');
                                }
                            }, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Case sensitivity (highlighted: case sensitive)", style: {
                            backgroundColor: this.caseSensitive && !this.useRegex ? buttonBackgroundColor : buttonDisabledBackgroundColor,
                            color: this.caseSensitive && !this.useRegex ? buttonTextColor : buttonDisabledTextColor,
                            fontWeight: 500,
                            paddingInline: 4,
                            marginInline: 4,
                            borderRadius: 4,
                            opacity: this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } },
                        "Cc",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: () => {
                                if (!this.currentSearchString)
                                    return;
                                this.caseSensitive = !this.caseSensitive;
                                this.searchForText(true);
                            }, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Regex matching (highlighted: use regex)", style: {
                            color: this.useRegex ? buttonTextColor : buttonDisabledTextColor,
                            backgroundColor: this.useRegex ? buttonBackgroundColor : buttonDisabledBackgroundColor,
                            fontWeight: 500,
                            paddingInline: 4,
                            marginInline: 4,
                            borderRadius: 4,
                            opacity: this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } },
                        ". *",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: () => {
                                if (!this.currentSearchString)
                                    return;
                                this.useRegex = !this.useRegex;
                                this.searchForText(true);
                            }, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Previous hit", style: {
                            backgroundColor: hitCount ? buttonBackgroundColor : buttonDisabledBackgroundColor,
                            color: hitCount ? buttonTextColor : buttonDisabledTextColor,
                            fontWeight: 500,
                            marginLeft: 16,
                            marginRight: 4,
                            paddingInline: 4,
                            borderRadius: 4,
                            opacity: this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                            verticalAlign: 'middle',
                        } },
                        "\u25C0",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: this.previousHit, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Next hit", style: {
                            backgroundColor: hitCount ? buttonBackgroundColor : buttonDisabledBackgroundColor,
                            color: hitCount ? buttonTextColor : buttonDisabledTextColor,
                            fontWeight: 500,
                            paddingInline: 4,
                            borderRadius: 4,
                            opacity: this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                            verticalAlign: 'middle',
                        } },
                        "\u25B6",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: this.nextHit, style: { display: 'none' } })),
                    react_1.default.createElement("p", { style: {
                            float: 'right',
                            padding: 3,
                            opacity: this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                            color: textColor,
                        } }, `Match${Number.isNaN(this.focusedMatchIndex) ? 'es:' : `: ${this.focusedMatchIndex + 1} /`} ${hitCount}`)),
                react_1.default.createElement(tooltip_1.BasicTooltip, { canPinTooltip: canPinTooltip, onPointerMove: () => ({ type: mouse_1.ON_POINTER_MOVE, position: { x: NaN, y: NaN }, time: NaN }), position: this.tooltipPinned
                        ? { x: this.pinnedPointerX, y: this.pinnedPointerY, width: 0, height: 0 }
                        : { x: this.pointerX, y: this.pointerY, width: 0, height: 0 }, pinned: this.tooltipPinned, selected: this.tooltipSelectedSeries, pinTooltip: this.pinTooltip, toggleSelectedTooltipItem: this.toggleSelectedTooltipItem, setSelectedTooltipItems: this.setSelectedTooltipItems, visible: this.tooltipPinned || (this.props.tooltipRequired && this.hoverIndex >= 0 && !(this.wobbleTimeLeft > 0)), info: {
                        header: null,
                        values: this.tooltipValues,
                    }, getChartContainerRef: this.props.containerRef }),
                debugHistory && (react_1.default.createElement("div", { style: {
                        position: 'absolute',
                        transform: `translate(20px, 20px)`,
                        background: 'beige',
                        opacity: 0.8,
                    } },
                    "history:",
                    react_1.default.createElement("ul", null, this.navigator.queue().map((d, i) => {
                        return (react_1.default.createElement("li", { key: `${d.index}-${i}` }, `${Number.isNaN(d.index) ? 'ZOOM/PAN' : d.index}${this.navigator.index() === i ? '⬅' : ''}`));
                    }))))));
        };
        this.drawCanvas = () => {
            if (!this.ctx || !this.glContext || !this.pickTexture)
                return;
            const renderFrame = (0, draw_a_frame_1.drawFrame)(this.ctx, this.glContext, this.props.chartDimensions.width, this.props.chartDimensions.height, this.getMinimapWidth(), this.getMinimapHeight(), this.getMinimapLeft(), this.getMinimapTop(), window.devicePixelRatio * this.pinchZoomScale, this.props.columnarViewModel, this.pickTexture, this.glResources.pickTextureRenderer, this.glResources.roundedRectRenderer, this.hoverIndex, unitRowPitch(this.props.columnarViewModel.position1), this.currentColor, this.props.theme);
            const anim = (t) => {
                const focusTimeDeltaMs = Number.isNaN(this.prevFocusTime) ? 0 : t - this.prevFocusTime;
                this.prevFocusTime = t;
                if (this.prevNodeTweenTime === Infinity)
                    this.prevNodeTweenTime = t;
                const nodeTweenTime = (0, common_2.clamp)((t - this.prevNodeTweenTime) / NODE_TWEEN_DURATION_MS, 0, 1);
                const nodeTweenInProgress = nodeTweenTime < 1;
                const dx0 = this.targetFocus.x0 - this.currentFocus.x0;
                const dx1 = this.targetFocus.x1 - this.currentFocus.x1;
                const dy0 = this.targetFocus.y0 - this.currentFocus.y0;
                const dy1 = this.targetFocus.y1 - this.currentFocus.y1;
                const currentExtentX = this.currentFocus.x1 - this.currentFocus.x0;
                const currentExtentY = this.currentFocus.y1 - this.currentFocus.y0;
                const relativeExpansionX = Math.max(1, (currentExtentX + dx1 - dx0) / currentExtentX);
                const relativeExpansionY = Math.max(1, (currentExtentX + dy1 - dy0) / currentExtentY);
                const jointRelativeExpansion = (relativeExpansionX + relativeExpansionY) / 2;
                const convergenceRateX = Math.min(1, focusTimeDeltaMs * RECURRENCE_ALPHA_PER_MS_X) / jointRelativeExpansion;
                const convergenceRateY = Math.min(1, focusTimeDeltaMs * RECURRENCE_ALPHA_PER_MS_Y) / jointRelativeExpansion;
                this.currentFocus.x0 += convergenceRateX * dx0;
                this.currentFocus.x1 += convergenceRateX * dx1;
                this.currentFocus.y0 += convergenceRateY * dy0;
                this.currentFocus.y1 += convergenceRateY * dy1;
                this.wobbleTimeLeft -= focusTimeDeltaMs;
                const wobbleAnimationInProgress = this.wobbleTimeLeft > 0;
                const timeFromWobbleStart = (0, common_2.clamp)(WOBBLE_DURATION - this.wobbleTimeLeft, 0, WOBBLE_DURATION);
                renderFrame([this.currentFocus.x0, this.currentFocus.x1, this.currentFocus.y0, this.currentFocus.y1], this.wobbleIndex, wobbleAnimationInProgress ? 0.01 + 0.99 * (0.5 - 0.5 * Math.cos(timeFromWobbleStart * WOBBLE_FREQUENCY)) : 0, nodeTweenTime);
                const maxDiff = Math.max(Math.abs(dx0), Math.abs(dx1), Math.abs(dy0), Math.abs(dy1));
                const focusAnimationInProgress = maxDiff > 1e-12;
                if (focusAnimationInProgress || wobbleAnimationInProgress || nodeTweenInProgress) {
                    this.animationRafId = window.requestAnimationFrame(anim);
                }
                else {
                    this.prevFocusTime = NaN;
                    this.currentFocus.x0 = this.targetFocus.x0;
                    this.currentFocus.x1 = this.targetFocus.x1;
                    this.currentFocus.y0 = this.targetFocus.y0;
                    this.currentFocus.y1 = this.targetFocus.y1;
                }
            };
            window.cancelAnimationFrame(this.animationRafId);
            this.animationRafId = window.requestAnimationFrame(anim);
            this.props.onRenderChange(true);
        };
        this.getMinimapWidth = () => this.props.chartDimensions.width / MINIMAP_SIZE_RATIO_X;
        this.getMinimapHeight = () => this.props.chartDimensions.height / MINIMAP_SIZE_RATIO_Y;
        this.getMinimapLeft = () => this.props.chartDimensions.width - this.getMinimapWidth();
        this.getMinimapTop = () => this.props.chartDimensions.height - this.getMinimapHeight();
        this.ensurePickTexture = () => {
            var _a;
            const { width, height } = this.props.chartDimensions;
            const pr = window.devicePixelRatio * this.pinchZoomScale;
            const textureWidth = pr * width;
            const textureHeight = pr * height;
            const current = this.pickTexture;
            if (this.glContext &&
                (current === kingly_1.NullTexture || current.width !== textureWidth || current.height !== textureHeight)) {
                current.delete();
                this.pickTexture =
                    (_a = (0, kingly_1.createTexture)(this.glContext, {
                        textureIndex: 0,
                        width: textureWidth,
                        height: textureHeight,
                        internalFormat: webgl_constants_1.GL.RGBA8,
                        data: null,
                    })) !== null && _a !== void 0 ? _a : kingly_1.NullTexture;
                (0, kingly_1.bindFramebuffer)(this.glContext, webgl_constants_1.GL.READ_FRAMEBUFFER, this.pickTexture.target());
            }
        };
        this.initializeGL = (gl) => {
            this.glResources = (0, ensure_webgl_1.ensureWebgl)(gl, Object.keys(this.props.columnarViewModel).filter(isAttributeKey));
            (0, upload_to_webgl_1.uploadToWebgl)(gl, this.glResources.attributes, this.props.columnarViewModel);
        };
        this.restoreGL = (gl) => {
            this.initializeGL(gl);
            this.pickTexture = kingly_1.NullTexture;
            this.uploadSearchColors();
            this.ensureTextureAndDraw();
        };
        this.tryCanvasContext = () => {
            const canvas = this.props.forwardStageRef.current;
            const glCanvas = this.glCanvasRef.current;
            this.ctx = canvas && canvas.getContext('2d');
            this.glContext = glCanvas && glCanvas.getContext('webgl2');
            this.ensurePickTexture();
            if (glCanvas && this.glContext && this.glResources === types_1.NULL_GL_RESOURCES) {
                glCanvas.addEventListener('webglcontextlost', this.contextLossHandler, false);
                glCanvas.addEventListener('webglcontextrestored', this.contextRestoreHandler, false);
                this.initializeGL(this.glContext);
            }
        };
        this.contextLossHandler = (event) => {
            window.cancelAnimationFrame(this.animationRafId);
            event.preventDefault();
        };
        this.contextRestoreHandler = () => {
            const glCanvas = this.glCanvasRef.current;
            if (!glCanvas || !this.glContext)
                return;
            this.restoreGL(this.glContext);
            const widthCss = glCanvas.style.width;
            const widthNum = parseFloat(widthCss);
            glCanvas.style.width = `${widthNum + 0.1}px`;
            window.setTimeout(() => {
                glCanvas.style.width = widthCss;
                if (this.glContext)
                    this.restoreGL(this.glContext);
            }, 0);
        };
        const columns = this.props.columnarViewModel;
        const datumCount = columns.position1.length / 2;
        if (datumCount % 1)
            throw new Error('flame error: position1 vector must have even values (x/y pairs)');
        if (datumCount * 2 !== columns.position0.length)
            throw new Error('flame error: Mismatch between position0 (xy) and position1 (xy) length');
        if (datumCount !== columns.size0.length)
            throw new Error('flame error: Mismatch between position1 (xy) and size0 length');
        if (datumCount !== columns.size1.length)
            throw new Error('flame error: Mismatch between position1 (xy) and size1 length');
        if (datumCount * 4 !== columns.color.length)
            throw new Error('flame error: Mismatch between position1 (xy) and color (rgba) length');
        if (datumCount !== columns.value.length)
            throw new Error('flame error: Mismatch between position1 (xy) and value length');
        if (datumCount !== columns.label.length)
            throw new Error('flame error: Mismatch between position1 (xy) and label length');
        this.targetFocus = this.getFocusOnRoot();
        this.bindControls();
        this.currentFocus = { ...this.targetFocus };
        this.navigator = new navigation_1.NavButtonControlledZoomPanHistory({ ...this.getFocusOnRoot(), index: 0 });
        this.pinchZoomSetInterval = NaN;
        this.pinchZoomScale = (_b = (_a = browserRootWindow().visualViewport) === null || _a === void 0 ? void 0 : _a.scale) !== null && _b !== void 0 ? _b : 1;
        this.setupViewportScaleChangeListener();
        this.currentColor = columns.color;
        this.prevNodeTweenTime =
            columns.position0 === columns.position1 && columns.size0 === columns.size1 ? -Infinity : Infinity;
    }
    focusOnNavElement(element) {
        if (!element) {
            return;
        }
        if ((0, common_2.isFiniteNumber)(element.index)) {
            this.focusOnNode(element.index);
        }
        else {
            this.focusOnRect(element);
        }
    }
    bindControls() {
        const { controlProviderCallback } = this.props;
        if (controlProviderCallback.resetFocus) {
            controlProviderCallback.resetFocus(() => this.resetFocus());
        }
        if (controlProviderCallback.focusOnNode) {
            controlProviderCallback.focusOnNode((nodeIndex) => {
                const rect = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, nodeIndex);
                this.navigator.add({ ...rect, index: nodeIndex });
                this.focusOnNode(nodeIndex);
            });
        }
        if (controlProviderCallback.search) {
            controlProviderCallback.search((text) => {
                if (!this.searchInputRef.current)
                    return;
                this.searchInputRef.current.value = text;
                this.searchForText(false);
            });
        }
    }
    resetFocus() {
        this.navigator.reset();
        this.targetFocus = this.getFocusOnRoot();
        this.wobble(0);
    }
    focusOnNode(nodeIndex) {
        this.targetFocus = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, nodeIndex);
        this.wobble(nodeIndex);
    }
    focusOnRect(rect) {
        this.targetFocus = rect;
        this.setState({});
    }
    wobble(nodeIndex) {
        this.wobbleTimeLeft = WOBBLE_DURATION;
        this.wobbleIndex = nodeIndex;
        this.prevFocusTime = NaN;
        this.hoverIndex = NaN;
        this.setState({});
    }
    getFocusOnRoot() {
        return focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, 0);
    }
    componentWillUnmount() {
        var _a;
        (_a = this.props.containerRef().current) === null || _a === void 0 ? void 0 : _a.removeEventListener('wheel', this.preventScroll);
    }
    chartDimensionsChanged({ height, width }) {
        return this.props.chartDimensions.height !== height || this.props.chartDimensions.width !== width;
    }
    updatePointerLocation(e) {
        if (!this.props.forwardStageRef.current || !this.ctx)
            return;
        const box = this.props.forwardStageRef.current.getBoundingClientRect();
        this.pointerX = e.clientX - box.left;
        this.pointerY = e.clientY - box.top;
        if (!this.tooltipPinned) {
            this.pinnedPointerX = this.pointerX;
            this.pinnedPointerY = this.pointerY;
        }
    }
    unpinTooltip(redraw = false) {
        this.pinnedPointerX = NaN;
        this.pinnedPointerY = NaN;
        this.tooltipPinned = false;
        this.tooltipSelectedSeries = [];
        this.updateHoverIndex();
        if (redraw) {
            this.smartDraw();
        }
    }
    updateHoverIndex() {
        var _a;
        const hoveredDatumIndex = this.getHoveredDatumIndex();
        const prevHoverIndex = this.hoverIndex >= 0 ? this.hoverIndex : NaN;
        this.hoverIndex = hoveredDatumIndex;
        if (!Object.is(this.hoverIndex, prevHoverIndex)) {
            if (Number.isFinite(hoveredDatumIndex)) {
                this.props.onElementOver([{ vmIndex: hoveredDatumIndex }]);
            }
            else {
                this.hoverIndex = NaN;
                this.props.onElementOut();
            }
        }
        if (prevHoverIndex !== this.hoverIndex) {
            const columns = this.props.columnarViewModel;
            const hoverValue = this.hoverIndex >= 0 ? columns.value[this.hoverIndex] : null;
            this.tooltipValues = !(0, common_2.isNil)(hoverValue)
                ? [
                    {
                        label: (_a = columns.label[this.hoverIndex]) !== null && _a !== void 0 ? _a : '',
                        color: getColor(columns.color, this.hoverIndex),
                        isHighlighted: false,
                        isVisible: true,
                        seriesIdentifier: { specId: '', key: '' },
                        value: hoverValue,
                        formattedValue: `${specValueFormatter(hoverValue)}`,
                        valueAccessor: this.hoverIndex,
                    },
                ]
                : [];
        }
        this.setState({});
    }
    getActiveCursor() {
        if (this.tooltipPinned)
            return constants_1.DEFAULT_CSS_CURSOR;
        if (this.startOfDragX)
            return 'grabbing';
        if (this.hoverIndex >= 0)
            return 'pointer';
        return 'grab';
    }
    smartDraw() {
        if (Number.isFinite(this.hoverIndex)) {
            this.hoverIndex = NaN;
            this.setState({});
        }
        else {
            this.drawCanvas();
        }
    }
}
FlameComponent.displayName = 'Flame';
FlameComponent.watchedKeys = ['Escape'];
const mapStateToProps = (state) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const flameSpec = (0, utils_1.getSpecsFromStore)(state.specs, __1.ChartType.Flame, specs_1.SpecType.Series)[0];
    const settingsSpec = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    const tooltipSpec = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    return {
        theme: (0, get_chart_theme_1.getChartThemeSelector)(state).flamegraph,
        debugHistory: settingsSpec.debug,
        columnarViewModel: (_a = flameSpec === null || flameSpec === void 0 ? void 0 : flameSpec.columnarData) !== null && _a !== void 0 ? _a : types_1.nullColumnarViewModel,
        controlProviderCallback: (_b = flameSpec === null || flameSpec === void 0 ? void 0 : flameSpec.controlProviderCallback) !== null && _b !== void 0 ? _b : {},
        animationDuration: (_c = flameSpec === null || flameSpec === void 0 ? void 0 : flameSpec.animation.duration) !== null && _c !== void 0 ? _c : 0,
        chartDimensions: state.parentDimensions,
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        tooltipRequired: tooltipSpec.type !== specs_1.TooltipType.None,
        canPinTooltip: (0, can_pin_tooltip_1.isPinnableTooltip)(state),
        search: (_d = flameSpec === null || flameSpec === void 0 ? void 0 : flameSpec.search) !== null && _d !== void 0 ? _d : { text: '' },
        onSeachTextChange: (_e = flameSpec === null || flameSpec === void 0 ? void 0 : flameSpec.onSearchTextChange) !== null && _e !== void 0 ? _e : (() => { }),
        onElementOver: (_f = settingsSpec.onElementOver) !== null && _f !== void 0 ? _f : (() => { }),
        onElementClick: (_g = settingsSpec.onElementClick) !== null && _g !== void 0 ? _g : (() => { }),
        onElementOut: (_h = settingsSpec.onElementOut) !== null && _h !== void 0 ? _h : (() => { }),
        onRenderChange: (_j = settingsSpec.onRenderChange) !== null && _j !== void 0 ? _j : (() => { }),
    };
};
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onChartRendered: chart_1.onChartRendered,
}, dispatch);
const FlameChartLayers = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(FlameComponent);
const FlameWithTooltip = (containerRef, forwardStageRef) => (react_1.default.createElement(FlameChartLayers, { forwardStageRef: forwardStageRef, containerRef: containerRef }));
exports.FlameWithTooltip = FlameWithTooltip;
//# sourceMappingURL=flame_chart.js.map