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
exports.ChartContainer = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var constants_1 = require("../common/constants");
var key_1 = require("../state/actions/key");
var mouse_1 = require("../state/actions/mouse");
var tooltip_1 = require("../state/actions/tooltip");
var get_chart_type_components_1 = require("../state/selectors/get_chart_type_components");
var get_internal_cursor_pointer_1 = require("../state/selectors/get_internal_cursor_pointer");
var get_internal_is_brushing_1 = require("../state/selectors/get_internal_is_brushing");
var get_internal_is_brushing_available_1 = require("../state/selectors/get_internal_is_brushing_available");
var get_internal_is_intialized_1 = require("../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../state/selectors/get_settings_spec");
var get_tooltip_spec_1 = require("../state/selectors/get_tooltip_spec");
var is_chart_empty_1 = require("../state/selectors/is_chart_empty");
var fast_deep_equal_1 = require("../utils/fast_deep_equal");
var no_results_1 = require("./no_results");
var ChartContainerComponent = (function (_super) {
    __extends(ChartContainerComponent, _super);
    function ChartContainerComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleMouseMove = function (_a) {
            var _b = _a.nativeEvent, offsetX = _b.offsetX, offsetY = _b.offsetY, timeStamp = _b.timeStamp;
            var _c = _this.props, isChartEmpty = _c.isChartEmpty, onPointerMove = _c.onPointerMove, internalChartRenderer = _c.internalChartRenderer;
            if (isChartEmpty || internalChartRenderer.name === 'FlameWithTooltip') {
                return;
            }
            onPointerMove({
                x: offsetX,
                y: offsetY,
            }, timeStamp);
        };
        _this.handleMouseLeave = function (_a) {
            var timeStamp = _a.nativeEvent.timeStamp;
            var _b = _this.props, isChartEmpty = _b.isChartEmpty, onPointerMove = _b.onPointerMove, isBrushing = _b.isBrushing;
            if (isChartEmpty) {
                return;
            }
            if (isBrushing) {
                return;
            }
            onPointerMove({ x: -1, y: -1 }, timeStamp);
        };
        _this.handleMouseDown = function (_a) {
            var _b = _a.nativeEvent, offsetX = _b.offsetX, offsetY = _b.offsetY, timeStamp = _b.timeStamp, button = _b.button;
            var _c = _this.props, isChartEmpty = _c.isChartEmpty, onMouseDown = _c.onMouseDown, isBrushingAvailable = _c.isBrushingAvailable, tooltipState = _c.tooltipState;
            if (tooltipState.pinned || button === 2 || isChartEmpty)
                return;
            if (isBrushingAvailable) {
                window.addEventListener('mouseup', _this.handleBrushEnd);
            }
            window.addEventListener('keyup', _this.handleKeyUp);
            onMouseDown({
                x: offsetX,
                y: offsetY,
            }, timeStamp);
        };
        _this.handleContextClose = function () {
            window.removeEventListener('keyup', _this.handleKeyUp);
            window.removeEventListener('click', _this.handleContextClose);
            window.removeEventListener('scroll', _this.handleContextClose);
            window.removeEventListener('visibilitychange', _this.handleContextClose);
            _this.props.onTooltipPinned(false, true);
        };
        _this.handleMouseRightClick = function (e) {
            var _a = _this.props, isChartEmpty = _a.isChartEmpty, tooltipState = _a.tooltipState;
            if (isChartEmpty) {
                return;
            }
            e.preventDefault();
            if (tooltipState.pinned) {
                _this.handleContextClose();
                return;
            }
            window.addEventListener('keyup', _this.handleKeyUp);
            window.addEventListener('click', _this.handleContextClose);
            window.addEventListener('scroll', _this.handleContextClose);
            window.addEventListener('visibilitychange', _this.handleContextClose);
            _this.props.onTooltipPinned(true);
        };
        _this.handleMouseUp = function (_a) {
            var _b = _a.nativeEvent, offsetX = _b.offsetX, offsetY = _b.offsetY, timeStamp = _b.timeStamp;
            var _c = _this.props, isChartEmpty = _c.isChartEmpty, onMouseUp = _c.onMouseUp, tooltipState = _c.tooltipState;
            if (tooltipState.pinned || isChartEmpty) {
                return;
            }
            window.removeEventListener('keyup', _this.handleKeyUp);
            onMouseUp({
                x: offsetX,
                y: offsetY,
            }, timeStamp);
        };
        _this.handleKeyUp = function (_a) {
            var key = _a.key;
            if (!ChartContainerComponent.watchedKeys.includes(key))
                return;
            window.removeEventListener('keyup', _this.handleKeyUp);
            var _b = _this.props, isChartEmpty = _b.isChartEmpty, onKeyPress = _b.onKeyPress;
            if (isChartEmpty) {
                return;
            }
            onKeyPress(key);
        };
        _this.handleBrushEnd = function () {
            var onMouseUp = _this.props.onMouseUp;
            window.removeEventListener('mouseup', _this.handleBrushEnd);
            onMouseUp({ x: -1, y: -1 }, Date.now());
        };
        return _this;
    }
    ChartContainerComponent.prototype.shouldComponentUpdate = function (nextProps) {
        return !(0, fast_deep_equal_1.deepEqual)(this.props, nextProps);
    };
    ChartContainerComponent.prototype.render = function () {
        var _a = this.props, status = _a.status, isChartEmpty = _a.isChartEmpty, settings = _a.settings, initialized = _a.initialized;
        if (!initialized || status === get_internal_is_intialized_1.InitStatus.ParentSizeInvalid) {
            return null;
        }
        if (status === get_internal_is_intialized_1.InitStatus.ChartNotInitialized ||
            status === get_internal_is_intialized_1.InitStatus.MissingChartType ||
            status === get_internal_is_intialized_1.InitStatus.SpecNotInitialized ||
            isChartEmpty) {
            return react_1.default.createElement(no_results_1.NoResults, { renderFn: settings === null || settings === void 0 ? void 0 : settings.noResults });
        }
        var _b = this.props, pointerCursor = _b.pointerCursor, internalChartRenderer = _b.internalChartRenderer, getChartContainerRef = _b.getChartContainerRef, forwardStageRef = _b.forwardStageRef;
        var pinnableTooltip = this.props.tooltip.actions.length > 0;
        return (react_1.default.createElement("div", { className: "echChartPointerContainer", style: {
                cursor: pointerCursor,
            }, onMouseMove: this.handleMouseMove, onMouseLeave: this.handleMouseLeave, onMouseDown: this.handleMouseDown, onMouseUp: this.handleMouseUp, onContextMenu: pinnableTooltip ? this.handleMouseRightClick : undefined }, internalChartRenderer(getChartContainerRef, forwardStageRef)));
    };
    ChartContainerComponent.displayName = 'ChartContainer';
    ChartContainerComponent.watchedKeys = ['Escape'];
    return ChartContainerComponent;
}(react_1.default.Component));
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onPointerMove: mouse_1.onPointerMove,
        onMouseUp: mouse_1.onMouseUp,
        onMouseDown: mouse_1.onMouseDown,
        onKeyPress: key_1.onKeyPress,
        onTooltipPinned: tooltip_1.onTooltipPinned,
        onTooltipItemSelected: tooltip_1.onTooltipItemSelected,
    }, dispatch);
};
var mapStateToProps = function (state) {
    var status = (0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state);
    var settings = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    var tooltip = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    var initialized = !state.specParsing && state.specsInitialized;
    var tooltipState = state.interactions.tooltip;
    if (status !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            status: status,
            initialized: initialized,
            tooltipState: tooltipState,
            pointerCursor: constants_1.DEFAULT_CSS_CURSOR,
            isBrushingAvailable: false,
            isBrushing: false,
            internalChartRenderer: function () { return null; },
            settings: settings,
            tooltip: tooltip,
        };
    }
    return {
        status: status,
        initialized: initialized,
        tooltipState: tooltipState,
        isChartEmpty: (0, is_chart_empty_1.isInternalChartEmptySelector)(state),
        pointerCursor: (0, get_internal_cursor_pointer_1.getInternalPointerCursor)(state),
        isBrushingAvailable: (0, get_internal_is_brushing_available_1.getInternalIsBrushingAvailableSelector)(state),
        isBrushing: (0, get_internal_is_brushing_1.getInternalIsBrushingSelector)(state),
        internalChartRenderer: (0, get_chart_type_components_1.getInternalChartRendererSelector)(state),
        settings: settings,
        tooltip: tooltip,
    };
};
exports.ChartContainer = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(ChartContainerComponent);
//# sourceMappingURL=chart_container.js.map