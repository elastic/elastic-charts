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
exports.CursorLine = void 0;
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
function canRenderBand(type, visible, fromExternalEvent) {
    return visible && (type === constants_1.TooltipType.Crosshairs || type === constants_1.TooltipType.VerticalCursor || fromExternalEvent);
}
var CursorLineComponent = (function (_super) {
    __extends(CursorLineComponent, _super);
    function CursorLineComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CursorLineComponent.prototype.render = function () {
        var _a = this.props, _b = _a.theme.crosshair, band = _b.band, line = _b.line, cursorPosition = _a.cursorPosition, tooltipType = _a.tooltipType, fromExternalEvent = _a.fromExternalEvent, isLine = _a.isLine;
        if (!cursorPosition || !canRenderBand(tooltipType, band.visible, fromExternalEvent) || !isLine) {
            return null;
        }
        var x = cursorPosition.x, y = cursorPosition.y, width = cursorPosition.width, height = cursorPosition.height;
        var strokeWidth = line.strokeWidth, stroke = line.stroke, dash = line.dash;
        var strokeDasharray = (dash !== null && dash !== void 0 ? dash : []).join(' ');
        return (react_1.default.createElement("svg", { className: "echCrosshair__cursor", width: "100%", height: "100%" },
            react_1.default.createElement("line", __assign({}, { x1: x, x2: x + width, y1: y, y2: y + height, strokeWidth: strokeWidth, stroke: stroke, strokeDasharray: strokeDasharray }))));
    };
    CursorLineComponent.displayName = 'CursorLine';
    return CursorLineComponent;
}(react_1.default.Component));
var mapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            theme: light_theme_1.LIGHT_THEME,
            chartRotation: 0,
            tooltipType: constants_1.TooltipType.None,
            isLine: false,
        };
    }
    var settings = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    var tooltip = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    var cursorBandPosition = (0, get_cursor_band_1.getCursorBandPositionSelector)(state);
    var fromExternalEvent = cursorBandPosition === null || cursorBandPosition === void 0 ? void 0 : cursorBandPosition.fromExternalEvent;
    var tooltipType = (0, specs_1.getTooltipType)(tooltip, settings, fromExternalEvent);
    var isLine = (cursorBandPosition === null || cursorBandPosition === void 0 ? void 0 : cursorBandPosition.width) === 0 || (cursorBandPosition === null || cursorBandPosition === void 0 ? void 0 : cursorBandPosition.height) === 0;
    return {
        theme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        chartRotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
        cursorPosition: cursorBandPosition,
        tooltipType: tooltipType,
        fromExternalEvent: fromExternalEvent,
        isLine: isLine,
    };
};
exports.CursorLine = (0, react_redux_1.connect)(mapStateToProps)(CursorLineComponent);
//# sourceMappingURL=cursor_line.js.map