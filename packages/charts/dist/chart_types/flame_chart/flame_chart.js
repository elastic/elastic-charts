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
var react_1 = __importStar(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var __1 = require("..");
var constants_1 = require("../../common/constants");
var kingly_1 = require("../../common/kingly");
var webgl_constants_1 = require("../../common/webgl_constants");
var tooltip_1 = require("../../components/tooltip/tooltip");
var specs_1 = require("../../specs");
var chart_1 = require("../../state/actions/chart");
var mouse_1 = require("../../state/actions/mouse");
var get_accessibility_config_1 = require("../../state/selectors/get_accessibility_config");
var get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
var get_tooltip_spec_1 = require("../../state/selectors/get_tooltip_spec");
var utils_1 = require("../../state/utils");
var common_1 = require("../../utils/common");
var navigation_1 = require("./navigation");
var common_2 = require("./render/common");
var draw_a_frame_1 = require("./render/draw_a_frame");
var ensure_webgl_1 = require("./render/ensure_webgl");
var upload_to_webgl_1 = require("./render/upload_to_webgl");
var shaders_1 = require("./shaders");
var types_1 = require("./types");
var PINCH_ZOOM_CHECK_INTERVAL_MS = 100;
var SIDE_OVERSHOOT_RATIO = 0.05;
var RECURRENCE_ALPHA_PER_MS_X = 0.01;
var RECURRENCE_ALPHA_PER_MS_Y = 0.0062;
var SINGLE_CLICK_EMPTY_FOCUS = true;
var IS_META_REQUIRED_FOR_ZOOM = false;
var ZOOM_SPEED = 0.0015;
var DEEPEST_ZOOM_RATIO = 1e-7;
var ZOOM_FROM_EDGE_BAND = 16;
var ZOOM_FROM_EDGE_BAND_LEFT = ZOOM_FROM_EDGE_BAND + draw_a_frame_1.PADDING_LEFT;
var ZOOM_FROM_EDGE_BAND_RIGHT = ZOOM_FROM_EDGE_BAND + draw_a_frame_1.PADDING_RIGHT;
var ZOOM_FROM_EDGE_BAND_TOP = ZOOM_FROM_EDGE_BAND + draw_a_frame_1.PADDING_TOP;
var ZOOM_FROM_EDGE_BAND_BOTTOM = ZOOM_FROM_EDGE_BAND + draw_a_frame_1.PADDING_BOTTOM;
var LEFT_MOUSE_BUTTON = 1;
var MINIMAP_SIZE_RATIO_X = 3;
var MINIMAP_SIZE_RATIO_Y = 3;
var SHOWN_ANCESTOR_COUNT = 2;
var WOBBLE_DURATION = 1000;
var WOBBLE_REPEAT_COUNT = 2;
var WOBBLE_FREQUENCY = 2 * Math.PI * (WOBBLE_REPEAT_COUNT / WOBBLE_DURATION);
var unitRowPitch = function (position) { return (position.length >= 4 ? position[1] - position[3] : 1); };
var initialPixelRowPitch = function () { return 16; };
var specValueFormatter = function (d) { return d; };
var browserRootWindow = function () {
    var rootWindow = window;
    while (window.parent && window.parent.window !== rootWindow)
        rootWindow = rootWindow.parent.window;
    return rootWindow;
};
var columnToRowPositions = function (_a, i) {
    var position1 = _a.position1, size1 = _a.size1;
    return ({
        x0: position1[i * 2],
        x1: position1[i * 2] + size1[i],
        y0: position1[i * 2 + 1],
        y1: position1[i * 2 + 1] + unitRowPitch(position1),
    });
};
var focusForArea = function (chartHeight, _a) {
    var x0 = _a.x0, x1 = _a.x1, y0 = _a.y0, y1 = _a.y1;
    var sideOvershoot = SIDE_OVERSHOOT_RATIO * (x1 - x0);
    var unitRowHeight = y1 - y0;
    var chartHeightInUnit = (chartHeight / initialPixelRowPitch()) * unitRowHeight;
    var y = Math.min(1, y1 + unitRowHeight * SHOWN_ANCESTOR_COUNT);
    var intendedY0 = y - chartHeightInUnit;
    var bottomOvershoot = Math.max(0, -intendedY0);
    var top = Math.min(1, y + bottomOvershoot);
    return {
        x0: Math.max(0, x0 - sideOvershoot),
        x1: Math.min(1, x1 + sideOvershoot),
        y0: Math.max(0, intendedY0),
        y1: Math.min(1, top),
    };
};
var focusRect = function (columnarViewModel, chartHeight, drilldownDatumIndex) { return focusForArea(chartHeight, columnToRowPositions(columnarViewModel, drilldownDatumIndex || 0)); };
var getColor = function (c, i) {
    var r = Math.round(255 * c[4 * i]);
    var g = Math.round(255 * c[4 * i + 1]);
    var b = Math.round(255 * c[4 * i + 2]);
    var a = c[4 * i + 3];
    return "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(a, ")");
};
var colorToDatumIndex = function (pixel) {
    var isEmptyArea = pixel[0] + pixel[1] + pixel[2] + pixel[3] < shaders_1.GEOM_INDEX_OFFSET;
    return isEmptyArea ? NaN : pixel[3] + 256 * (pixel[2] + 256 * (pixel[1] + 256 * pixel[0])) - shaders_1.GEOM_INDEX_OFFSET;
};
var getRegExp = function (searchString) {
    var regex;
    try {
        regex = new RegExp(searchString);
    }
    catch (_a) {
        return new RegExp('iIUiUYIuiGjhG678987gjhgfytr678576');
    }
    return regex;
};
var isAttributeKey = function (keyCandidate) {
    return keyCandidate in shaders_1.attributeLocations;
};
var FlameComponent = (function (_super) {
    __extends(FlameComponent, _super);
    function FlameComponent(props) {
        var _this = _super.call(this, props) || this;
        _this.ctx = null;
        _this.glContext = null;
        _this.pickTexture = kingly_1.NullTexture;
        _this.glResources = types_1.NULL_GL_RESOURCES;
        _this.glCanvasRef = (0, react_1.createRef)();
        _this.pinchZoomSetInterval = NaN;
        _this.pointerX = NaN;
        _this.pointerY = NaN;
        _this.pinnedPointerX = NaN;
        _this.pinnedPointerY = NaN;
        _this.tooltipPinned = false;
        _this.tooltipSelectedSeries = [];
        _this.hoverIndex = NaN;
        _this.tooltipValues = [];
        _this.animationRafId = NaN;
        _this.prevT = NaN;
        _this.startOfDragX = NaN;
        _this.startOfDragY = NaN;
        _this.startOfDragFocusLeft = NaN;
        _this.startOfDragFocusTop = NaN;
        _this.searchInputRef = (0, react_1.createRef)();
        _this.currentSearchString = '';
        _this.currentSearchHitCount = 0;
        _this.caseSensitive = false;
        _this.useRegex = false;
        _this.focusedMatchIndex = NaN;
        _this.wobbleTimeLeft = 0;
        _this.wobbleIndex = NaN;
        _this.onTooltipPinned = function (pinned) {
            if (!pinned) {
                _this.unpinTooltip(true);
                return;
            }
            _this.tooltipPinned = true;
            _this.tooltipSelectedSeries = _this.tooltipValues;
        };
        _this.onTooltipItemSelected = function (tooltipValue) {
            if (!_this.tooltipPinned)
                return;
            _this.tooltipSelectedSeries = _this.tooltipSelectedSeries.length === 0 ? [tooltipValue] : [];
            _this.setState({});
        };
        _this.setupDevicePixelRatioChangeListener = function () {
            window.matchMedia("(resolution: ".concat(window.devicePixelRatio, "dppx)")).addEventListener('change', function () {
                _this.setState({});
                _this.setupDevicePixelRatioChangeListener();
            }, { once: true });
        };
        _this.setupViewportScaleChangeListener = function () {
            window.clearInterval(_this.pinchZoomSetInterval);
            _this.pinchZoomSetInterval = window.setInterval(function () {
                var pinchZoomScale = browserRootWindow().visualViewport.scale;
                if (pinchZoomScale !== _this.pinchZoomScale) {
                    _this.pinchZoomScale = pinchZoomScale;
                    _this.setState({});
                }
            }, PINCH_ZOOM_CHECK_INTERVAL_MS);
        };
        _this.componentDidMount = function () {
            var _a;
            _this.tryCanvasContext();
            _this.drawCanvas();
            _this.props.onChartRendered();
            _this.setupDevicePixelRatioChangeListener();
            (_a = _this.props.containerRef().current) === null || _a === void 0 ? void 0 : _a.addEventListener('wheel', _this.preventScroll, { passive: false });
        };
        _this.ensureTextureAndDraw = function () {
            _this.ensurePickTexture();
            _this.drawCanvas();
        };
        _this.componentDidUpdate = function (_a) {
            var chartDimensions = _a.chartDimensions;
            if (!_this.ctx)
                _this.tryCanvasContext();
            if (_this.tooltipPinned && _this.chartDimensionsChanged(chartDimensions)) {
                _this.unpinTooltip();
            }
            _this.bindControls();
            _this.ensureTextureAndDraw();
        };
        _this.pointerInMinimap = function (x, y) {
            return x === (0, common_1.clamp)(x, _this.getMinimapLeft(), _this.getMinimapLeft() + _this.getMinimapWidth()) &&
                y === (0, common_1.clamp)(y, _this.getMinimapTop(), _this.getMinimapTop() + _this.getMinimapHeight());
        };
        _this.datumAtXY = function (x, y) {
            return _this.glContext ? colorToDatumIndex((0, kingly_1.readPixel)(_this.glContext, x, y)) : NaN;
        };
        _this.getHoveredDatumIndex = function () {
            var pr = window.devicePixelRatio * _this.pinchZoomScale;
            var x = _this.tooltipPinned ? _this.pinnedPointerX : _this.pointerX;
            var y = _this.tooltipPinned ? _this.pinnedPointerY : _this.pointerY;
            return {
                datumIndex: _this.datumAtXY(pr * x, pr * (_this.props.chartDimensions.height - y)),
            };
        };
        _this.getDragDistanceX = function () { return _this.pointerX - _this.startOfDragX; };
        _this.getDragDistanceY = function () { return -(_this.pointerY - _this.startOfDragY); };
        _this.isDragging = function (_a) {
            var buttons = _a.buttons;
            return buttons & LEFT_MOUSE_BUTTON;
        };
        _this.handleMouseHoverMove = function (e) {
            if (!_this.isDragging(e)) {
                e.stopPropagation();
                _this.updatePointerLocation(e);
                if (!_this.tooltipPinned) {
                    _this.updateHoverIndex();
                }
            }
        };
        _this.handleMouseDragMove = function (e) {
            e.stopPropagation();
            _this.updatePointerLocation(e);
            if (_this.isDragging(e)) {
                var dragInMinimap = _this.pointerInMinimap(_this.startOfDragX, _this.startOfDragY);
                var focusMoveDirection = dragInMinimap ? 1 : -1;
                var _a = _this.currentFocus, x0 = _a.x0, x1 = _a.x1, y0 = _a.y0, y1 = _a.y1;
                var focusWidth = x1 - x0;
                var focusHeight = y1 - y0;
                if (Number.isNaN(_this.startOfDragFocusLeft))
                    _this.startOfDragFocusLeft = x0;
                if (Number.isNaN(_this.startOfDragFocusTop))
                    _this.startOfDragFocusTop = y0;
                var dragDistanceX = _this.getDragDistanceX();
                var dragDistanceY = _this.getDragDistanceY();
                var _b = _this.props.chartDimensions, chartWidth = _b.width, chartHeight = _b.height;
                var focusChartWidth = chartWidth - draw_a_frame_1.PADDING_LEFT - draw_a_frame_1.PADDING_RIGHT;
                var focusChartHeight = chartHeight - draw_a_frame_1.PADDING_TOP - draw_a_frame_1.PADDING_BOTTOM;
                var dragSpeedX = (dragInMinimap ? MINIMAP_SIZE_RATIO_X / focusWidth : 1) / focusChartWidth;
                var dragSpeedY = (dragInMinimap ? MINIMAP_SIZE_RATIO_Y / focusHeight : 1) / focusChartHeight;
                var deltaIntentX = focusMoveDirection * dragDistanceX * dragSpeedX * focusWidth;
                var deltaIntentY = focusMoveDirection * dragDistanceY * dragSpeedY * focusHeight;
                var deltaCorrectionX = deltaIntentX > 0
                    ? Math.min(0, 1 - (_this.startOfDragFocusLeft + focusWidth + deltaIntentX))
                    : -Math.min(0, _this.startOfDragFocusLeft + deltaIntentX);
                var deltaCorrectionY = deltaIntentY > 0
                    ? Math.min(0, 1 - (_this.startOfDragFocusTop + focusHeight + deltaIntentY))
                    : -Math.min(0, _this.startOfDragFocusTop + deltaIntentY);
                var deltaX = deltaIntentX + deltaCorrectionX;
                var deltaY = deltaIntentY + deltaCorrectionY;
                var newX0 = (0, common_1.clamp)(_this.startOfDragFocusLeft + deltaX, 0, 1);
                var newX1 = (0, common_1.clamp)(_this.startOfDragFocusLeft + focusWidth + deltaX, 0, 1);
                var newY0 = (0, common_1.clamp)(_this.startOfDragFocusTop + deltaY, 0, 1);
                var newY1 = (0, common_1.clamp)(_this.startOfDragFocusTop + focusHeight + deltaY, 0, 1);
                var newFocus = { x0: newX0, x1: newX1, y0: newY0, y1: newY1 };
                _this.currentFocus = newFocus;
                _this.targetFocus = newFocus;
                _this.navigator.add(__assign(__assign({}, newFocus), { index: NaN }));
                _this.smartDraw();
            }
        };
        _this.clearDrag = function () {
            _this.startOfDragX = NaN;
            _this.startOfDragY = NaN;
            _this.startOfDragFocusLeft = NaN;
            _this.startOfDragFocusTop = NaN;
        };
        _this.resetDrag = function () {
            _this.startOfDragX = _this.pointerX;
            _this.startOfDragY = _this.pointerY;
        };
        _this.handleMouseDown = function (e) {
            e.stopPropagation();
            if (Number.isNaN(_this.pointerX + _this.pointerY))
                return;
            if (e.button !== 2) {
                _this.resetDrag();
            }
            if (_this.tooltipPinned)
                return;
            window.addEventListener('mousemove', _this.handleMouseDragMove, { passive: true });
            window.addEventListener('mouseup', _this.handleMouseUp);
            _this.setState({});
        };
        _this.handleMouseUp = function (e) {
            e.stopPropagation();
            window.removeEventListener('mousemove', _this.handleMouseDragMove);
            window.removeEventListener('mouseup', _this.handleMouseUp);
            if (_this.tooltipPinned) {
                _this.unpinTooltip();
                _this.clearDrag();
                return;
            }
            _this.updatePointerLocation(e);
            var dragDistanceX = _this.getDragDistanceX();
            var dragDistanceY = _this.getDragDistanceY();
            if (!dragDistanceX && !dragDistanceY) {
                var hovered = _this.getHoveredDatumIndex();
                var isDoubleClick = e.detail > 1;
                var hasClickedOnRectangle = Number.isFinite(hovered === null || hovered === void 0 ? void 0 : hovered.datumIndex);
                var mustFocus = SINGLE_CLICK_EMPTY_FOCUS || isDoubleClick !== hasClickedOnRectangle;
                var isContextClick = e.button === 2;
                if (mustFocus && !isContextClick && !_this.pointerInMinimap(_this.pointerX, _this.pointerY)) {
                    var datumIndex = hovered.datumIndex;
                    var rect = focusRect(_this.props.columnarViewModel, _this.props.chartDimensions.height, datumIndex);
                    _this.navigator.add(__assign(__assign({}, rect), { index: datumIndex }));
                    _this.focusOnNode(datumIndex);
                    _this.props.onElementClick([{ vmIndex: datumIndex }]);
                }
                if (mustFocus && isContextClick) {
                    _this.handleContextClick(e);
                }
            }
            _this.clearDrag();
            _this.setState({});
        };
        _this.handleContextClose = function () {
            window.removeEventListener('keyup', _this.handleKeyUp);
            window.removeEventListener('click', _this.handleContextClose);
            window.removeEventListener('visibilitychange', _this.handleContextClose);
            _this.onTooltipPinned(false);
        };
        _this.handleContextClick = function (e) {
            e.preventDefault();
            window.addEventListener('keyup', _this.handleKeyUp);
            window.addEventListener('click', _this.handleContextClose);
            window.addEventListener('visibilitychange', _this.handleContextClose);
            _this.onTooltipPinned(!_this.tooltipPinned);
        };
        _this.handleKeyUp = function (_a) {
            var key = _a.key;
            if (!FlameComponent.watchedKeys.includes(key))
                return;
            window.removeEventListener('keyup', _this.handleKeyUp);
            _this.unpinTooltip();
        };
        _this.handleMouseLeave = function (e) {
            e.stopPropagation();
            if (!_this.tooltipPinned) {
                _this.smartDraw();
            }
        };
        _this.preventScroll = function (e) { return e.metaKey === IS_META_REQUIRED_FOR_ZOOM && e.preventDefault(); };
        _this.handleWheel = function (e) {
            if (e.metaKey !== IS_META_REQUIRED_FOR_ZOOM)
                return;
            _this.unpinTooltip();
            _this.updatePointerLocation(e);
            var _a = _this.currentFocus, x0 = _a.x0, x1 = _a.x1, y0 = _a.y0, y1 = _a.y1;
            var wheelDelta = -e.deltaY;
            var delta = wheelDelta * ZOOM_SPEED;
            var unitX = _this.pointerX / _this.props.chartDimensions.width;
            var unitY = (_this.props.chartDimensions.height - _this.pointerY) / _this.props.chartDimensions.height;
            var zoomOut = delta <= 0;
            var midX = Math.abs(x0) < draw_a_frame_1.EPSILON && (zoomOut || _this.pointerX < ZOOM_FROM_EDGE_BAND_LEFT)
                ? 0
                : Math.abs(x1 - 1) < draw_a_frame_1.EPSILON &&
                    (zoomOut || _this.pointerX > _this.props.chartDimensions.width - ZOOM_FROM_EDGE_BAND_RIGHT)
                    ? 1
                    : (0, common_1.clamp)(x0 + unitX * Math.abs(x1 - x0), 0, 1);
            var midY = Math.abs(y0) < draw_a_frame_1.EPSILON &&
                (zoomOut || _this.pointerY > _this.props.chartDimensions.height - ZOOM_FROM_EDGE_BAND_BOTTOM)
                ? 0
                : Math.abs(y1 - 1) < draw_a_frame_1.EPSILON && (zoomOut || _this.pointerY < ZOOM_FROM_EDGE_BAND_TOP)
                    ? 1
                    : (0, common_1.clamp)(y0 + unitY * Math.abs(y1 - y0), 0, 1);
            var targetX0 = (0, common_1.clamp)(x0 - delta * (x0 - midX), 0, 1);
            var targetX1 = (0, common_1.clamp)(x1 + delta * (midX - x1), 0, 1);
            var targetY0 = (0, common_1.clamp)(y0 - delta * (y0 - midY), 0, 1);
            var targetY1 = (0, common_1.clamp)(y1 + delta * (midY - y1), 0, 1);
            var newX0 = Math.min(targetX0, midX);
            var newX1 = Math.max(targetX1, midX);
            var newY0 = Math.min(targetY0, midY);
            var newY1 = Math.max(targetY1, midY);
            var xZoom = (e.ctrlKey || !e.altKey) && newX1 - newX0 >= DEEPEST_ZOOM_RATIO;
            var yZoom = (e.ctrlKey || e.altKey) && newY1 - newY0 >= unitRowPitch(_this.props.columnarViewModel.position1);
            if (xZoom || yZoom) {
                var newFocus = {
                    x0: xZoom ? newX0 : x0,
                    x1: xZoom ? newX1 : x1,
                    y0: yZoom ? newY0 : y0,
                    y1: yZoom ? newY1 : y1,
                };
                _this.navigator.add(__assign(__assign({}, newFocus), { index: NaN }));
                _this.currentFocus = newFocus;
                _this.targetFocus = newFocus;
            }
            _this.smartDraw();
        };
        _this.focusOnAllMatches = function () {
            _this.currentSearchHitCount = 0;
            var searchString = _this.currentSearchString;
            var customizedSearchString = _this.caseSensitive ? searchString : searchString.toLowerCase();
            var regex = _this.useRegex && getRegExp(searchString);
            var columns = _this.props.columnarViewModel;
            _this.currentColor = new Float32Array(columns.color);
            var labels = columns.label;
            var size = columns.size1;
            var position = columns.position1;
            var rowHeight = unitRowPitch(position);
            var datumCount = labels.length;
            var x0 = Infinity;
            var x1 = -Infinity;
            var y0 = Infinity;
            var y1 = -Infinity;
            for (var i = 0; i < datumCount; i++) {
                var label = _this.caseSensitive ? labels[i] : labels[i].toLowerCase();
                if (regex ? label.match(regex) : label.includes(customizedSearchString)) {
                    _this.currentSearchHitCount++;
                    x0 = Math.min(x0, position[2 * i]);
                    x1 = Math.max(x1, position[2 * i] + size[i]);
                    y0 = Math.min(y0, position[2 * i + 1]);
                    y1 = Math.max(y1, position[2 * i + 1] + rowHeight);
                }
                else {
                    _this.currentColor[4 * i + 3] *= 0.25;
                }
            }
            if (Number.isFinite(x0) && searchString.length > 0) {
                Object.assign(_this.targetFocus, focusForArea(_this.props.chartDimensions.height, { x0: x0, x1: x1, y0: y0, y1: y1 }));
            }
        };
        _this.uploadSearchColors = function () {
            var colorSetter = _this.glResources.attributes.get('color');
            if (_this.glContext && colorSetter && _this.currentColor.length === _this.props.columnarViewModel.color.length) {
                (0, upload_to_webgl_1.uploadToWebgl)(_this.glContext, new Map([['color', colorSetter]]), { color: _this.currentColor });
            }
        };
        _this.searchForText = function (force) {
            var input = _this.searchInputRef.current;
            var searchString = input === null || input === void 0 ? void 0 : input.value;
            if (!input || typeof searchString !== 'string' || (searchString === _this.currentSearchString && !force))
                return;
            _this.currentSearchString = searchString;
            _this.focusOnAllMatches();
            _this.uploadSearchColors();
            _this.focusedMatchIndex = NaN;
            _this.setState({});
        };
        _this.handleEnterKey = function (e) {
            e.stopPropagation();
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    _this.previousHit();
                }
                else {
                    _this.nextHit();
                }
                return true;
            }
            return false;
        };
        _this.clearSearchText = function () {
            if (!_this.searchInputRef.current)
                return;
            _this.searchInputRef.current.value = '';
            _this.searchForText(false);
        };
        _this.handleEscapeKey = function (e) {
            if (e.key === 'Escape') {
                _this.clearSearchText();
            }
        };
        _this.handleSearchFieldKeyPress = function (e) {
            e.stopPropagation();
            if (!_this.handleEnterKey(e)) {
                _this.searchForText(false);
            }
        };
        _this.focusOnHit = function () {
            if (Number.isNaN(_this.focusedMatchIndex)) {
                _this.focusOnAllMatches();
            }
            else {
                var datumIndex = NaN;
                var hitEnumerator = -1;
                var searchString = _this.currentSearchString;
                var customizedSearchString = _this.caseSensitive ? searchString : searchString.toLowerCase();
                var regex = _this.useRegex && getRegExp(searchString);
                var labels = _this.props.columnarViewModel.label;
                for (var i = 0; i < labels.length; i++) {
                    var label = _this.caseSensitive ? labels[i] : labels[i].toLowerCase();
                    if (regex ? label.match(regex) : label.includes(customizedSearchString)) {
                        datumIndex = i;
                        hitEnumerator++;
                        if (hitEnumerator === _this.focusedMatchIndex)
                            break;
                    }
                }
                if (hitEnumerator >= 0) {
                    _this.targetFocus = focusRect(_this.props.columnarViewModel, _this.props.chartDimensions.height, datumIndex);
                    _this.prevT = NaN;
                    _this.hoverIndex = NaN;
                    _this.wobbleTimeLeft = WOBBLE_DURATION;
                    _this.wobbleIndex = datumIndex;
                }
            }
        };
        _this.previousHit = function () {
            var hitCount = _this.currentSearchHitCount;
            if (!_this.currentSearchString || hitCount === 0)
                return;
            _this.focusedMatchIndex = Number.isNaN(_this.focusedMatchIndex)
                ? hitCount - 1
                : _this.focusedMatchIndex === 0
                    ? NaN
                    : _this.focusedMatchIndex - 1;
            _this.focusOnHit();
            _this.setState({});
        };
        _this.nextHit = function () {
            var hitCount = _this.currentSearchHitCount;
            if (!_this.currentSearchString || hitCount === 0)
                return;
            _this.focusedMatchIndex = _this.focusedMatchIndex = Number.isNaN(_this.focusedMatchIndex)
                ? 0
                : _this.focusedMatchIndex === hitCount - 1
                    ? NaN
                    : _this.focusedMatchIndex + 1;
            _this.focusOnHit();
            _this.setState({});
        };
        _this.render = function () {
            var _a = _this.props, forwardStageRef = _a.forwardStageRef, _b = _a.chartDimensions, requestedWidth = _b.width, requestedHeight = _b.height, a11ySettings = _a.a11ySettings, debugHistory = _a.debugHistory;
            var width = (0, common_2.roundUpSize)(requestedWidth);
            var height = (0, common_2.roundUpSize)(requestedHeight);
            var style = {
                width: width,
                height: height,
                top: 0,
                left: 0,
                padding: 0,
                margin: 0,
                border: 0,
                position: 'absolute',
                cursor: _this.getActiveCursor(),
            };
            var dpr = window.devicePixelRatio * _this.pinchZoomScale;
            var canvasWidth = width * dpr;
            var canvasHeight = height * dpr;
            var hitCount = _this.currentSearchHitCount;
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
                    react_1.default.createElement("canvas", { ref: _this.glCanvasRef, className: "echCanvasRenderer", width: canvasWidth, height: canvasHeight, style: style, role: "presentation" }),
                    react_1.default.createElement("canvas", { ref: forwardStageRef, tabIndex: 0, className: "echCanvasRenderer", width: canvasWidth, height: canvasHeight, onMouseMove: _this.handleMouseHoverMove, onMouseDown: _this.handleMouseDown, onMouseLeave: _this.handleMouseLeave, onKeyPress: _this.handleEnterKey, onKeyUp: _this.handleEscapeKey, onWheel: _this.handleWheel, style: __assign(__assign({}, style), { outline: 'none' }), role: "presentation" })),
                react_1.default.createElement("div", { style: {
                        position: 'absolute',
                        transform: "translateY(".concat(_this.props.chartDimensions.height - draw_a_frame_1.PADDING_BOTTOM + 4, "px)"),
                    } },
                    react_1.default.createElement("label", { title: "Navigate back", style: {
                            color: _this.navigator.canNavBackward() ? 'black' : 'darkgrey',
                            fontWeight: 'bolder',
                            paddingLeft: 16,
                            paddingRight: 4,
                        } },
                        "\u1438",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: function () { return _this.focusOnNavElement(_this.navigator.navBackward()); }, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Reset", style: {
                            color: 'black',
                            fontWeight: 'bolder',
                            paddingInline: 4,
                        } },
                        "\u25B2",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: function () { return _this.resetFocus(); }, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Navigate forward", style: {
                            color: _this.navigator.canNavForward() ? 'black' : 'darkgray',
                            fontWeight: 'bolder',
                            paddingLeft: 4,
                            paddingRight: 16,
                        } },
                        "\u1433",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: function () { return _this.focusOnNavElement(_this.navigator.navForward()); }, style: { display: 'none' } })),
                    react_1.default.createElement("input", { ref: _this.searchInputRef, title: "Search string or regex pattern", size: 16, type: "text", tabIndex: 0, placeholder: "Search string", onKeyPress: _this.handleSearchFieldKeyPress, onKeyUp: _this.handleEscapeKey, style: {
                            border: '0px solid lightgray',
                            padding: 3,
                            outline: 'none',
                            background: 'rgba(255,0,255,0)',
                        } }),
                    react_1.default.createElement("label", { title: "Clear text", style: {
                            backgroundColor: 'rgb(228, 228, 228)',
                            fontWeight: 'bolder',
                            paddingInline: 4,
                            marginInline: 4,
                            borderRadius: 4,
                            opacity: _this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } },
                        "Clear",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: function () {
                                if (_this.currentSearchString && _this.searchInputRef.current) {
                                    _this.clearSearchText();
                                }
                            }, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Case sensitivity (highlighted: case sensitive)", style: {
                            color: _this.caseSensitive && !_this.useRegex ? 'black' : 'darkgrey',
                            backgroundColor: 'rgb(228, 228, 228)',
                            fontWeight: 'bolder',
                            paddingInline: 4,
                            marginInline: 4,
                            borderRadius: 4,
                            opacity: _this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } },
                        "Cc",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: function () {
                                if (!_this.currentSearchString)
                                    return;
                                _this.caseSensitive = !_this.caseSensitive;
                                _this.searchForText(true);
                            }, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Regex matching (highlighted: use regex)", style: {
                            color: _this.useRegex ? 'black' : 'darkgrey',
                            backgroundColor: 'rgb(228, 228, 228)',
                            fontWeight: 'bolder',
                            paddingInline: 4,
                            marginInline: 4,
                            borderRadius: 4,
                            opacity: _this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } },
                        ". *",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: function () {
                                if (!_this.currentSearchString)
                                    return;
                                _this.useRegex = !_this.useRegex;
                                _this.searchForText(true);
                            }, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Previous hit", style: {
                            color: hitCount ? 'black' : 'darkgrey',
                            fontWeight: 'bolder',
                            paddingLeft: 16,
                            paddingRight: 4,
                            opacity: _this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } },
                        "\u25C0",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: _this.previousHit, style: { display: 'none' } })),
                    react_1.default.createElement("label", { title: "Next hit", style: {
                            color: hitCount ? 'black' : 'darkgrey',
                            fontWeight: 'bolder',
                            paddingInline: 4,
                            opacity: _this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } },
                        "\u25B6",
                        react_1.default.createElement("input", { type: "button", tabIndex: 0, onClick: _this.nextHit, style: { display: 'none' } })),
                    react_1.default.createElement("p", { style: {
                            float: 'right',
                            padding: 3,
                            opacity: _this.currentSearchString ? 1 : 0,
                            transition: 'opacity 250ms ease-in-out',
                        } }, "Match".concat(Number.isNaN(_this.focusedMatchIndex) ? 'es:' : ": ".concat(_this.focusedMatchIndex + 1, " /"), " ").concat(hitCount))),
                react_1.default.createElement(tooltip_1.BasicTooltip, { onPointerMove: function () { return ({ type: mouse_1.ON_POINTER_MOVE, position: { x: NaN, y: NaN }, time: NaN }); }, position: _this.tooltipPinned
                        ? { x: _this.pinnedPointerX, y: _this.pinnedPointerY, width: 0, height: 0 }
                        : { x: _this.pointerX, y: _this.pointerY, width: 0, height: 0 }, pinned: _this.tooltipPinned, selected: _this.tooltipSelectedSeries, onTooltipPinned: _this.onTooltipPinned, onTooltipItemSelected: _this.onTooltipItemSelected, visible: _this.tooltipPinned || (_this.props.tooltipRequired && _this.hoverIndex >= 0 && !(_this.wobbleTimeLeft > 0)), info: {
                        header: null,
                        values: _this.tooltipValues,
                    }, getChartContainerRef: _this.props.containerRef }),
                debugHistory && (react_1.default.createElement("div", { style: {
                        position: 'absolute',
                        transform: "translate(20px, 20px)",
                        background: 'beige',
                        opacity: 0.8,
                    } },
                    "history:",
                    react_1.default.createElement("ul", null, _this.navigator.queue().map(function (d, i) {
                        return (react_1.default.createElement("li", { key: "".concat(d.index, "-").concat(i) }, "".concat(Number.isNaN(d.index) ? 'ZOOM/PAN' : d.index).concat(_this.navigator.index() === i ? '⬅' : '')));
                    }))))));
        };
        _this.drawCanvas = function () {
            if (!_this.ctx || !_this.glContext || !_this.pickTexture)
                return;
            var renderFrame = (0, draw_a_frame_1.drawFrame)(_this.ctx, _this.glContext, _this.props.chartDimensions.width, _this.props.chartDimensions.height, _this.getMinimapWidth(), _this.getMinimapHeight(), _this.getMinimapLeft(), _this.getMinimapTop(), window.devicePixelRatio * _this.pinchZoomScale, _this.props.columnarViewModel, _this.pickTexture, _this.glResources.pickTextureRenderer, _this.glResources.roundedRectRenderer, _this.hoverIndex, unitRowPitch(_this.props.columnarViewModel.position1), _this.currentColor);
            var anim = function (t) {
                var msDeltaT = Number.isNaN(_this.prevT) ? 0 : t - _this.prevT;
                _this.prevT = t;
                var dx0 = _this.targetFocus.x0 - _this.currentFocus.x0;
                var dx1 = _this.targetFocus.x1 - _this.currentFocus.x1;
                var dy0 = _this.targetFocus.y0 - _this.currentFocus.y0;
                var dy1 = _this.targetFocus.y1 - _this.currentFocus.y1;
                var currentExtentX = _this.currentFocus.x1 - _this.currentFocus.x0;
                var currentExtentY = _this.currentFocus.y1 - _this.currentFocus.y0;
                var relativeExpansionX = Math.max(1, (currentExtentX + dx1 - dx0) / currentExtentX);
                var relativeExpansionY = Math.max(1, (currentExtentX + dy1 - dy0) / currentExtentY);
                var jointRelativeExpansion = (relativeExpansionX + relativeExpansionY) / 2;
                var convergenceRateX = Math.min(1, msDeltaT * RECURRENCE_ALPHA_PER_MS_X) / jointRelativeExpansion;
                var convergenceRateY = Math.min(1, msDeltaT * RECURRENCE_ALPHA_PER_MS_Y) / jointRelativeExpansion;
                _this.currentFocus.x0 += convergenceRateX * dx0;
                _this.currentFocus.x1 += convergenceRateX * dx1;
                _this.currentFocus.y0 += convergenceRateY * dy0;
                _this.currentFocus.y1 += convergenceRateY * dy1;
                _this.wobbleTimeLeft -= msDeltaT;
                var shouldWobble = _this.wobbleTimeLeft > 0;
                var timeFromWobbleStart = (0, common_1.clamp)(WOBBLE_DURATION - _this.wobbleTimeLeft, 0, WOBBLE_DURATION);
                renderFrame([_this.currentFocus.x0, _this.currentFocus.x1, _this.currentFocus.y0, _this.currentFocus.y1], _this.wobbleIndex, shouldWobble ? 0.01 + 0.99 * (0.5 - 0.5 * Math.cos(timeFromWobbleStart * WOBBLE_FREQUENCY)) : 0);
                var maxDiff = Math.max(Math.abs(dx0), Math.abs(dx1), Math.abs(dy0), Math.abs(dy1));
                if (maxDiff > 1e-12 || shouldWobble) {
                    _this.animationRafId = window.requestAnimationFrame(anim);
                }
                else {
                    _this.prevT = NaN;
                    _this.currentFocus.x0 = _this.targetFocus.x0;
                    _this.currentFocus.x1 = _this.targetFocus.x1;
                    _this.currentFocus.y0 = _this.targetFocus.y0;
                    _this.currentFocus.y1 = _this.targetFocus.y1;
                }
            };
            window.cancelAnimationFrame(_this.animationRafId);
            _this.animationRafId = window.requestAnimationFrame(anim);
            _this.props.onRenderChange(true);
        };
        _this.getMinimapWidth = function () { return _this.props.chartDimensions.width / MINIMAP_SIZE_RATIO_X; };
        _this.getMinimapHeight = function () { return _this.props.chartDimensions.height / MINIMAP_SIZE_RATIO_Y; };
        _this.getMinimapLeft = function () { return _this.props.chartDimensions.width - _this.getMinimapWidth(); };
        _this.getMinimapTop = function () { return _this.props.chartDimensions.height - _this.getMinimapHeight(); };
        _this.ensurePickTexture = function () {
            var _a;
            var _b = _this.props.chartDimensions, width = _b.width, height = _b.height;
            var pr = window.devicePixelRatio * _this.pinchZoomScale;
            var textureWidth = pr * width;
            var textureHeight = pr * height;
            var current = _this.pickTexture;
            if (_this.glContext &&
                (current === kingly_1.NullTexture || current.width !== textureWidth || current.height !== textureHeight)) {
                current.delete();
                _this.pickTexture =
                    (_a = (0, kingly_1.createTexture)(_this.glContext, {
                        textureIndex: 0,
                        width: textureWidth,
                        height: textureHeight,
                        internalFormat: webgl_constants_1.GL.RGBA8,
                        data: null,
                    })) !== null && _a !== void 0 ? _a : kingly_1.NullTexture;
                (0, kingly_1.bindFramebuffer)(_this.glContext, webgl_constants_1.GL.READ_FRAMEBUFFER, _this.pickTexture.target());
            }
        };
        _this.initializeGL = function (gl) {
            _this.glResources = (0, ensure_webgl_1.ensureWebgl)(gl, Object.keys(_this.props.columnarViewModel).filter(isAttributeKey));
            (0, upload_to_webgl_1.uploadToWebgl)(gl, _this.glResources.attributes, _this.props.columnarViewModel);
        };
        _this.restoreGL = function (gl) {
            _this.initializeGL(gl);
            _this.pickTexture = kingly_1.NullTexture;
            _this.uploadSearchColors();
            _this.ensureTextureAndDraw();
        };
        _this.tryCanvasContext = function () {
            var canvas = _this.props.forwardStageRef.current;
            var glCanvas = _this.glCanvasRef.current;
            _this.ctx = canvas && canvas.getContext('2d');
            _this.glContext = glCanvas && glCanvas.getContext('webgl2');
            _this.ensurePickTexture();
            if (glCanvas && _this.glContext && _this.glResources === types_1.NULL_GL_RESOURCES) {
                glCanvas.addEventListener('webglcontextlost', _this.contextLossHandler, false);
                glCanvas.addEventListener('webglcontextrestored', _this.contextRestoreHandler, false);
                _this.initializeGL(_this.glContext);
            }
        };
        _this.contextLossHandler = function (event) {
            window.cancelAnimationFrame(_this.animationRafId);
            event.preventDefault();
        };
        _this.contextRestoreHandler = function () {
            var glCanvas = _this.glCanvasRef.current;
            if (!glCanvas || !_this.glContext)
                return;
            _this.restoreGL(_this.glContext);
            var widthCss = glCanvas.style.width;
            var widthNum = parseFloat(widthCss);
            glCanvas.style.width = "".concat(widthNum + 0.1, "px");
            window.setTimeout(function () {
                glCanvas.style.width = widthCss;
                if (_this.glContext)
                    _this.restoreGL(_this.glContext);
            }, 0);
        };
        var columns = _this.props.columnarViewModel;
        var datumCount = columns.position1.length / 2;
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
        _this.targetFocus = _this.getFocusOnRoot();
        _this.bindControls();
        _this.currentFocus = __assign({}, _this.targetFocus);
        _this.navigator = new navigation_1.NavButtonControlledZoomPanHistory(__assign(__assign({}, _this.getFocusOnRoot()), { index: 0 }));
        _this.pinchZoomSetInterval = NaN;
        _this.pinchZoomScale = browserRootWindow().visualViewport.scale;
        _this.setupViewportScaleChangeListener();
        _this.currentColor = columns.color;
        return _this;
    }
    FlameComponent.prototype.focusOnNavElement = function (element) {
        if (!element) {
            return;
        }
        if ((0, common_1.isFiniteNumber)(element.index)) {
            this.focusOnNode(element.index);
        }
        else {
            this.focusOnRect(element);
        }
    };
    FlameComponent.prototype.bindControls = function () {
        var _this = this;
        var controlProviderCallback = this.props.controlProviderCallback;
        if (controlProviderCallback.resetFocus) {
            controlProviderCallback.resetFocus(function () { return _this.resetFocus(); });
        }
        if (controlProviderCallback.focusOnNode) {
            controlProviderCallback.focusOnNode(function (nodeIndex) {
                var rect = focusRect(_this.props.columnarViewModel, _this.props.chartDimensions.height, nodeIndex);
                _this.navigator.add(__assign(__assign({}, rect), { index: nodeIndex }));
                _this.focusOnNode(nodeIndex);
            });
        }
    };
    FlameComponent.prototype.resetFocus = function () {
        this.navigator.reset();
        this.targetFocus = this.getFocusOnRoot();
        this.wobble(0);
    };
    FlameComponent.prototype.focusOnNode = function (nodeIndex) {
        this.targetFocus = focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, nodeIndex);
        this.wobble(nodeIndex);
    };
    FlameComponent.prototype.focusOnRect = function (rect) {
        this.targetFocus = rect;
        this.setState({});
    };
    FlameComponent.prototype.wobble = function (nodeIndex) {
        this.wobbleTimeLeft = WOBBLE_DURATION;
        this.wobbleIndex = nodeIndex;
        this.prevT = NaN;
        this.hoverIndex = NaN;
        this.setState({});
    };
    FlameComponent.prototype.getFocusOnRoot = function () {
        return focusRect(this.props.columnarViewModel, this.props.chartDimensions.height, 0);
    };
    FlameComponent.prototype.componentWillUnmount = function () {
        var _a;
        (_a = this.props.containerRef().current) === null || _a === void 0 ? void 0 : _a.removeEventListener('wheel', this.preventScroll);
    };
    FlameComponent.prototype.chartDimensionsChanged = function (_a) {
        var height = _a.height, width = _a.width;
        return this.props.chartDimensions.height !== height || this.props.chartDimensions.width !== width;
    };
    FlameComponent.prototype.updatePointerLocation = function (e) {
        if (!this.props.forwardStageRef.current || !this.ctx)
            return;
        var box = this.props.forwardStageRef.current.getBoundingClientRect();
        this.pointerX = e.clientX - box.left;
        this.pointerY = e.clientY - box.top;
        if (!this.tooltipPinned) {
            this.pinnedPointerX = this.pointerX;
            this.pinnedPointerY = this.pointerY;
        }
    };
    FlameComponent.prototype.unpinTooltip = function (redraw) {
        if (redraw === void 0) { redraw = false; }
        this.pinnedPointerX = NaN;
        this.pinnedPointerY = NaN;
        this.tooltipPinned = false;
        this.tooltipSelectedSeries = [];
        this.updateHoverIndex();
        if (redraw) {
            this.smartDraw();
        }
    };
    FlameComponent.prototype.updateHoverIndex = function () {
        var hovered = this.getHoveredDatumIndex();
        var prevHoverIndex = this.hoverIndex >= 0 ? this.hoverIndex : NaN;
        if (hovered) {
            this.hoverIndex = hovered.datumIndex;
            if (!Object.is(this.hoverIndex, prevHoverIndex)) {
                if (Number.isFinite(hovered.datumIndex)) {
                    this.props.onElementOver([{ vmIndex: hovered.datumIndex }]);
                }
                else {
                    this.hoverIndex = NaN;
                    this.props.onElementOut();
                }
            }
            if (prevHoverIndex !== this.hoverIndex) {
                var columns = this.props.columnarViewModel;
                this.tooltipValues =
                    this.hoverIndex >= 0
                        ? [
                            {
                                label: columns.label[this.hoverIndex],
                                color: getColor(columns.color, this.hoverIndex),
                                isHighlighted: false,
                                isVisible: true,
                                seriesIdentifier: { specId: '', key: '' },
                                value: columns.value[this.hoverIndex],
                                formattedValue: "".concat(specValueFormatter(columns.value[this.hoverIndex])),
                                valueAccessor: this.hoverIndex,
                            },
                        ]
                        : [];
            }
            this.setState({});
        }
    };
    FlameComponent.prototype.getActiveCursor = function () {
        if (this.tooltipPinned)
            return constants_1.DEFAULT_CSS_CURSOR;
        if (this.startOfDragX)
            return 'grabbing';
        if (this.hoverIndex >= 0)
            return 'pointer';
        return 'grab';
    };
    FlameComponent.prototype.smartDraw = function () {
        if (Number.isFinite(this.hoverIndex)) {
            this.hoverIndex = NaN;
            this.setState({});
        }
        else {
            this.drawCanvas();
        }
    };
    FlameComponent.displayName = 'Flame';
    FlameComponent.watchedKeys = ['Escape'];
    return FlameComponent;
}(react_1.default.Component));
var mapStateToProps = function (state) {
    var _a, _b, _c, _d, _e, _f, _g;
    var flameSpec = (0, utils_1.getSpecsFromStore)(state.specs, __1.ChartType.Flame, specs_1.SpecType.Series)[0];
    var settingsSpec = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    return {
        debugHistory: settingsSpec.debug,
        columnarViewModel: (_a = flameSpec === null || flameSpec === void 0 ? void 0 : flameSpec.columnarData) !== null && _a !== void 0 ? _a : types_1.nullColumnarViewModel,
        controlProviderCallback: (_b = flameSpec === null || flameSpec === void 0 ? void 0 : flameSpec.controlProviderCallback) !== null && _b !== void 0 ? _b : {},
        animationDuration: (_c = flameSpec === null || flameSpec === void 0 ? void 0 : flameSpec.animation.duration) !== null && _c !== void 0 ? _c : 0,
        chartDimensions: state.parentDimensions,
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        tooltipRequired: (0, get_tooltip_spec_1.getTooltipSpecSelector)(state).type !== specs_1.TooltipType.None,
        onElementOver: (_d = settingsSpec.onElementOver) !== null && _d !== void 0 ? _d : (function () { }),
        onElementClick: (_e = settingsSpec.onElementClick) !== null && _e !== void 0 ? _e : (function () { }),
        onElementOut: (_f = settingsSpec.onElementOut) !== null && _f !== void 0 ? _f : (function () { }),
        onRenderChange: (_g = settingsSpec.onRenderChange) !== null && _g !== void 0 ? _g : (function () { }),
    };
};
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onChartRendered: chart_1.onChartRendered,
    }, dispatch);
};
var FlameChartLayers = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(FlameComponent);
var FlameWithTooltip = function (containerRef, forwardStageRef) { return (react_1.default.createElement(FlameChartLayers, { forwardStageRef: forwardStageRef, containerRef: containerRef })); };
exports.FlameWithTooltip = FlameWithTooltip;
//# sourceMappingURL=flame_chart.js.map