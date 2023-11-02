"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartContainer = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const no_results_1 = require("./no_results");
const chart_types_1 = require("../chart_types");
const constants_1 = require("../common/constants");
const key_1 = require("../state/actions/key");
const mouse_1 = require("../state/actions/mouse");
const tooltip_1 = require("../state/actions/tooltip");
const can_pin_tooltip_1 = require("../state/selectors/can_pin_tooltip");
const get_chart_type_components_1 = require("../state/selectors/get_chart_type_components");
const get_internal_cursor_pointer_1 = require("../state/selectors/get_internal_cursor_pointer");
const get_internal_is_brushing_1 = require("../state/selectors/get_internal_is_brushing");
const get_internal_is_brushing_available_1 = require("../state/selectors/get_internal_is_brushing_available");
const get_internal_is_intialized_1 = require("../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../state/selectors/get_settings_spec");
const get_tooltip_spec_1 = require("../state/selectors/get_tooltip_spec");
const is_chart_empty_1 = require("../state/selectors/is_chart_empty");
const fast_deep_equal_1 = require("../utils/fast_deep_equal");
class ChartContainerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleMouseMove = ({ nativeEvent: { offsetX, offsetY, timeStamp }, }) => {
            const { isChartEmpty, disableInteractions, onPointerMove, internalChartRenderer } = this.props;
            if (isChartEmpty || disableInteractions || internalChartRenderer.name === 'FlameWithTooltip') {
                return;
            }
            onPointerMove({
                x: offsetX,
                y: offsetY,
            }, timeStamp);
        };
        this.handleMouseLeave = ({ nativeEvent: { timeStamp } }) => {
            const { isChartEmpty, disableInteractions, onPointerMove, isBrushing } = this.props;
            if (isChartEmpty || disableInteractions || isBrushing) {
                return;
            }
            onPointerMove({ x: -1, y: -1 }, timeStamp);
        };
        this.handleMouseDown = ({ nativeEvent: { offsetX, offsetY, timeStamp, button, ctrlKey }, }) => {
            const { isChartEmpty, disableInteractions, onMouseDown, isBrushingAvailable, tooltipState } = this.props;
            if (tooltipState.pinned || button === constants_1.SECONDARY_BUTTON || ctrlKey || isChartEmpty || disableInteractions)
                return;
            if (isBrushingAvailable) {
                window.addEventListener('mouseup', this.handleBrushEnd);
            }
            window.addEventListener('keyup', this.handleKeyUp);
            onMouseDown({
                x: offsetX,
                y: offsetY,
            }, timeStamp);
        };
        this.handleUnpinningTooltip = () => {
            window.removeEventListener('keyup', this.handleKeyUp);
            window.removeEventListener('click', this.handleUnpinningTooltip);
            window.removeEventListener('scroll', this.handleUnpinningTooltip);
            window.removeEventListener('visibilitychange', this.handleUnpinningTooltip);
            this.props.pinTooltip(false, true);
        };
        this.handleContextMenu = (e) => {
            const { isChartEmpty, disableInteractions, tooltipState } = this.props;
            if (isChartEmpty || disableInteractions) {
                return;
            }
            e.preventDefault();
            if (tooltipState.pinned) {
                this.handleUnpinningTooltip();
                return;
            }
            window.addEventListener('keyup', this.handleKeyUp);
            window.addEventListener('click', this.handleUnpinningTooltip);
            window.addEventListener('scroll', this.handleUnpinningTooltip);
            window.addEventListener('visibilitychange', this.handleUnpinningTooltip);
            this.props.pinTooltip(true);
        };
        this.handleMouseUp = ({ nativeEvent: { offsetX, offsetY, timeStamp } }) => {
            const { isChartEmpty, disableInteractions, onMouseUp, tooltipState } = this.props;
            if (tooltipState.pinned || isChartEmpty || disableInteractions) {
                return;
            }
            window.removeEventListener('keyup', this.handleKeyUp);
            onMouseUp({
                x: offsetX,
                y: offsetY,
            }, timeStamp);
        };
        this.handleKeyUp = ({ key }) => {
            if (!ChartContainerComponent.watchedKeys.includes(key))
                return;
            window.removeEventListener('keyup', this.handleKeyUp);
            const { isChartEmpty, disableInteractions, onKeyPress } = this.props;
            if (isChartEmpty || disableInteractions) {
                return;
            }
            onKeyPress(key);
        };
        this.handleBrushEnd = () => {
            const { onMouseUp } = this.props;
            window.removeEventListener('mouseup', this.handleBrushEnd);
            onMouseUp({ x: -1, y: -1 }, Date.now());
        };
    }
    shouldComponentUpdate(nextProps) {
        return !(0, fast_deep_equal_1.deepEqual)(this.props, nextProps);
    }
    render() {
        const { status, isChartEmpty, settings, initialized } = this.props;
        if (!initialized || status === get_internal_is_intialized_1.InitStatus.ParentSizeInvalid) {
            return null;
        }
        if (status === get_internal_is_intialized_1.InitStatus.ChartNotInitialized ||
            status === get_internal_is_intialized_1.InitStatus.MissingChartType ||
            status === get_internal_is_intialized_1.InitStatus.SpecNotInitialized ||
            isChartEmpty) {
            return react_1.default.createElement(no_results_1.NoResults, { renderFn: settings === null || settings === void 0 ? void 0 : settings.noResults });
        }
        const { pointerCursor, internalChartRenderer, getChartContainerRef, forwardStageRef } = this.props;
        return (react_1.default.createElement("div", { className: "echChartPointerContainer", style: {
                cursor: pointerCursor,
            }, onMouseMove: this.handleMouseMove, onMouseLeave: this.handleMouseLeave, onMouseDown: this.handleMouseDown, onMouseUp: this.handleMouseUp, onContextMenu: this.props.canPinTooltip ? this.handleContextMenu : undefined }, internalChartRenderer(getChartContainerRef, forwardStageRef)));
    }
}
ChartContainerComponent.displayName = 'ChartContainer';
ChartContainerComponent.watchedKeys = ['Escape'];
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onPointerMove: mouse_1.onPointerMove,
    onMouseUp: mouse_1.onMouseUp,
    onMouseDown: mouse_1.onMouseDown,
    onKeyPress: key_1.onKeyPress,
    pinTooltip: tooltip_1.pinTooltip,
}, dispatch);
const mapStateToProps = (state) => {
    const status = (0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state);
    const settings = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    const tooltip = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    const initialized = !state.specParsing && state.specsInitialized;
    const tooltipState = state.interactions.tooltip;
    if (status !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            status,
            initialized,
            tooltipState,
            canPinTooltip: false,
            pointerCursor: constants_1.DEFAULT_CSS_CURSOR,
            isBrushingAvailable: false,
            isBrushing: false,
            internalChartRenderer: () => null,
            settings,
            tooltip,
            disableInteractions: false,
        };
    }
    return {
        status,
        initialized,
        tooltipState,
        isChartEmpty: (0, is_chart_empty_1.isInternalChartEmptySelector)(state),
        canPinTooltip: (0, can_pin_tooltip_1.isPinnableTooltip)(state),
        pointerCursor: (0, get_internal_cursor_pointer_1.getInternalPointerCursor)(state),
        isBrushingAvailable: (0, get_internal_is_brushing_available_1.getInternalIsBrushingAvailableSelector)(state),
        isBrushing: (0, get_internal_is_brushing_1.getInternalIsBrushingSelector)(state),
        internalChartRenderer: (0, get_chart_type_components_1.getInternalChartRendererSelector)(state),
        settings,
        tooltip,
        disableInteractions: state.chartType === chart_types_1.ChartType.Flame,
    };
};
exports.ChartContainer = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(ChartContainerComponent);
//# sourceMappingURL=chart_container.js.map