"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorBand = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const specs_1 = require("../../../../specs");
const constants_1 = require("../../../../specs/constants");
const get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
const get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
const is_brushing_1 = require("../../../../state/selectors/is_brushing");
const utils_1 = require("../../../../state/utils");
const light_theme_1 = require("../../../../utils/themes/light_theme");
const get_cursor_band_1 = require("../../state/selectors/get_cursor_band");
function canRenderBand(type, pinned, visible, fromExternalEvent) {
    return (pinned || (visible && (type === constants_1.TooltipType.Crosshairs || type === constants_1.TooltipType.VerticalCursor || fromExternalEvent)));
}
class CursorBandComponent extends react_1.default.Component {
    render() {
        var _a, _b;
        const { theme: { crosshair: { band }, }, isBrushing, cursorPosition, tooltipType, fromExternalEvent, tooltipState: { pinned }, } = this.props;
        const isBand = ((_a = cursorPosition === null || cursorPosition === void 0 ? void 0 : cursorPosition.width) !== null && _a !== void 0 ? _a : 0) > 0 && ((_b = cursorPosition === null || cursorPosition === void 0 ? void 0 : cursorPosition.height) !== null && _b !== void 0 ? _b : 0) > 0;
        if (isBrushing ||
            !isBand ||
            !cursorPosition ||
            !canRenderBand(tooltipType, pinned, band.visible, fromExternalEvent)) {
            return null;
        }
        const { x, y, width, height } = cursorPosition;
        const { fill } = band;
        return (react_1.default.createElement("svg", { className: "echCrosshair__cursor", width: "100%", height: "100%" },
            react_1.default.createElement("rect", { x, y, width, height, fill })));
    }
}
CursorBandComponent.displayName = 'CursorBand';
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            isBrushing: false,
            theme: light_theme_1.LIGHT_THEME,
            chartRotation: 0,
            tooltipType: constants_1.TooltipType.None,
            tooltipState: (0, utils_1.getInitialTooltipState)(),
        };
    }
    const settings = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    const tooltip = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    const cursorBandPosition = (0, get_cursor_band_1.getCursorBandPositionSelector)(state);
    const fromExternalEvent = cursorBandPosition === null || cursorBandPosition === void 0 ? void 0 : cursorBandPosition.fromExternalEvent;
    const tooltipType = (0, specs_1.getTooltipType)(tooltip, settings, fromExternalEvent);
    return {
        isBrushing: (0, is_brushing_1.isBrushingSelector)(state),
        theme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        chartRotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
        cursorPosition: cursorBandPosition,
        tooltipType,
        fromExternalEvent,
        tooltipState: (0, get_tooltip_interaction_state_1.getTooltipInteractionState)(state),
    };
};
exports.CursorBand = (0, react_redux_1.connect)(mapStateToProps)(CursorBandComponent);
//# sourceMappingURL=cursor_band.js.map