"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorCrossLine = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const specs_1 = require("../../../../specs");
const constants_1 = require("../../../../specs/constants");
const get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
const light_theme_1 = require("../../../../utils/themes/light_theme");
const get_cursor_band_1 = require("../../state/selectors/get_cursor_band");
const get_cursor_line_1 = require("../../state/selectors/get_cursor_line");
function canRenderHelpLine(type, visible) {
    return visible && type === constants_1.TooltipType.Crosshairs;
}
class CursorCrossLineComponent extends react_1.default.Component {
    render() {
        const { theme: { crosshair: { crossLine }, }, cursorCrossLinePosition, tooltipType, } = this.props;
        if (!cursorCrossLinePosition || !canRenderHelpLine(tooltipType, crossLine.visible)) {
            return null;
        }
        const { strokeWidth, stroke, dash } = crossLine;
        const style = {
            strokeWidth,
            stroke,
            strokeDasharray: (dash !== null && dash !== void 0 ? dash : []).join(' '),
        };
        return (react_1.default.createElement("svg", { className: "echCrosshair__crossLine", width: "100%", height: "100%" },
            react_1.default.createElement("line", { ...cursorCrossLinePosition, ...style })));
    }
}
CursorCrossLineComponent.displayName = 'CursorCrossLine';
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            theme: light_theme_1.LIGHT_THEME,
            chartRotation: 0,
            tooltipType: constants_1.TooltipType.None,
        };
    }
    const settings = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    const tooltip = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    const cursorBandPosition = (0, get_cursor_band_1.getCursorBandPositionSelector)(state);
    const fromExternalEvent = cursorBandPosition === null || cursorBandPosition === void 0 ? void 0 : cursorBandPosition.fromExternalEvent;
    const tooltipType = (0, specs_1.getTooltipType)(tooltip, settings, fromExternalEvent);
    return {
        theme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        chartRotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
        cursorCrossLinePosition: (0, get_cursor_line_1.getCursorLinePositionSelector)(state),
        tooltipType,
    };
};
exports.CursorCrossLine = (0, react_redux_1.connect)(mapStateToProps)(CursorCrossLineComponent);
//# sourceMappingURL=cursor_crossline.js.map