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
exports.CursorCrossLine = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var specs_1 = require("../../../../specs");
var constants_1 = require("../../../../specs/constants");
var get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
var light_theme_1 = require("../../../../utils/themes/light_theme");
var get_cursor_band_1 = require("../../state/selectors/get_cursor_band");
var get_cursor_line_1 = require("../../state/selectors/get_cursor_line");
function canRenderHelpLine(type, visible) {
    return visible && type === constants_1.TooltipType.Crosshairs;
}
var CursorCrossLineComponent = (function (_super) {
    __extends(CursorCrossLineComponent, _super);
    function CursorCrossLineComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CursorCrossLineComponent.prototype.render = function () {
        var _a = this.props, crossLine = _a.theme.crosshair.crossLine, cursorCrossLinePosition = _a.cursorCrossLinePosition, tooltipType = _a.tooltipType;
        if (!cursorCrossLinePosition || !canRenderHelpLine(tooltipType, crossLine.visible)) {
            return null;
        }
        var strokeWidth = crossLine.strokeWidth, stroke = crossLine.stroke, dash = crossLine.dash;
        var style = {
            strokeWidth: strokeWidth,
            stroke: stroke,
            strokeDasharray: (dash !== null && dash !== void 0 ? dash : []).join(' '),
        };
        return (react_1.default.createElement("svg", { className: "echCrosshair__crossLine", width: "100%", height: "100%" },
            react_1.default.createElement("line", __assign({}, cursorCrossLinePosition, style))));
    };
    CursorCrossLineComponent.displayName = 'CursorCrossLine';
    return CursorCrossLineComponent;
}(react_1.default.Component));
var mapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            theme: light_theme_1.LIGHT_THEME,
            chartRotation: 0,
            tooltipType: constants_1.TooltipType.None,
        };
    }
    var settings = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    var tooltip = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    var cursorBandPosition = (0, get_cursor_band_1.getCursorBandPositionSelector)(state);
    var fromExternalEvent = cursorBandPosition === null || cursorBandPosition === void 0 ? void 0 : cursorBandPosition.fromExternalEvent;
    var tooltipType = (0, specs_1.getTooltipType)(tooltip, settings, fromExternalEvent);
    return {
        theme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        chartRotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
        cursorCrossLinePosition: (0, get_cursor_line_1.getCursorLinePositionSelector)(state),
        tooltipType: tooltipType,
    };
};
exports.CursorCrossLine = (0, react_redux_1.connect)(mapStateToProps)(CursorCrossLineComponent);
//# sourceMappingURL=cursor_crossline.js.map