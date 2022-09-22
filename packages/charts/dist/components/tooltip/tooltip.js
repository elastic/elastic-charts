"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicTooltip = exports.Tooltip = exports.TooltipComponent = void 0;
var react_1 = __importStar(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var colors_1 = require("../../common/colors");
var specs_1 = require("../../specs");
var mouse_1 = require("../../state/actions/mouse");
var tooltip_1 = require("../../state/actions/tooltip");
var get_chart_rotation_1 = require("../../state/selectors/get_chart_rotation");
var get_chart_theme_1 = require("../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
var get_internal_is_tooltip_visible_1 = require("../../state/selectors/get_internal_is_tooltip_visible");
var get_internal_tooltip_anchor_position_1 = require("../../state/selectors/get_internal_tooltip_anchor_position");
var get_internal_tooltip_info_1 = require("../../state/selectors/get_internal_tooltip_info");
var get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
var get_tooltip_selected_items_1 = require("../../state/selectors/get_tooltip_selected_items");
var get_tooltip_spec_1 = require("../../state/selectors/get_tooltip_spec");
var common_1 = require("../../utils/common");
var light_theme_1 = require("../../utils/themes/light_theme");
var portal_1 = require("../portal");
var tooltip_body_1 = require("./components/tooltip_body");
var tooltip_provider_1 = require("./components/tooltip_provider");
var TooltipComponent = function (_a) {
    var _b, _c, _d, _e, _f, _g;
    var _h = _a.tooltip, header = _h.header, footer = _h.footer, actions = _h.actions, headerFormatter = _h.headerFormatter, actionPrompt = _h.actionPrompt, selectionPrompt = _h.selectionPrompt, anchorRef = _a.anchorRef, info = _a.info, zIndex = _a.zIndex, position = _a.position, getChartContainerRef = _a.getChartContainerRef, settings = _a.settings, tooltipTheme = _a.tooltipTheme, visible = _a.visible, rotation = _a.rotation, chartId = _a.chartId, onPointerMove = _a.onPointerMove, backgroundColor = _a.backgroundColor, pinned = _a.pinned, selected = _a.selected, onTooltipItemSelected = _a.onTooltipItemSelected, onTooltipPinned = _a.onTooltipPinned;
    var chartRef = getChartContainerRef();
    var handleScroll = function (e) {
        var target = e.target;
        if (target.classList.contains('echTooltip__tableBody')) {
            e.stopImmediatePropagation();
            return;
        }
        onPointerMove({ x: -1, y: -1 }, Date.now());
    };
    (0, react_1.useEffect)(function () {
        window.addEventListener('scroll', handleScroll, true);
        return function () { return window.removeEventListener('scroll', handleScroll, true); };
    }, []);
    var popperSettings = (0, react_1.useMemo)(function () {
        var _a;
        if (!settings || typeof settings === 'string') {
            return;
        }
        var placement = settings.placement, fallbackPlacements = settings.fallbackPlacements, boundary = settings.boundary, rest = __rest(settings, ["placement", "fallbackPlacements", "boundary"]);
        return __assign(__assign({}, rest), { placement: placement !== null && placement !== void 0 ? placement : (rotation === 0 || rotation === 180 ? portal_1.Placement.Right : portal_1.Placement.Top), fallbackPlacements: fallbackPlacements !== null && fallbackPlacements !== void 0 ? fallbackPlacements : (rotation === 0 || rotation === 180
                ? [portal_1.Placement.Right, portal_1.Placement.Left, portal_1.Placement.Top, portal_1.Placement.Bottom]
                : [portal_1.Placement.Top, portal_1.Placement.Bottom, portal_1.Placement.Right, portal_1.Placement.Left]), boundary: boundary === 'chart' ? (_a = chartRef.current) !== null && _a !== void 0 ? _a : undefined : boundary });
    }, [settings, chartRef, rotation]);
    if (!visible) {
        return null;
    }
    var isMostlyRTL = (0, common_1.hasMostlyRTLItems)(__spreadArray(__spreadArray([], __read(((_d = (_c = (_b = info === null || info === void 0 ? void 0 : info.values) === null || _b === void 0 ? void 0 : _b.map) === null || _c === void 0 ? void 0 : _c.call(_b, function (_a) {
        var label = _a.label;
        return label;
    })) !== null && _d !== void 0 ? _d : [])), false), [
        (_f = (_e = info === null || info === void 0 ? void 0 : info.header) === null || _e === void 0 ? void 0 : _e.label) !== null && _f !== void 0 ? _f : '',
    ], false));
    var columns = [
        {
            id: 'color',
            type: 'color',
        },
        {
            id: 'label',
            type: 'custom',
            cell: function (_a) {
                var label = _a.label;
                return react_1.default.createElement("span", { className: "echTooltip__label" }, label);
            },
            hidden: function (items) { return items.every(function (_a) {
                var label = _a.label;
                return !label;
            }); },
            style: {
                textAlign: 'left',
            },
        },
        {
            id: 'value',
            type: 'custom',
            cell: function (_a) {
                var formattedValue = _a.formattedValue;
                return (react_1.default.createElement("span", { className: "echTooltip__value", dir: "ltr" }, formattedValue));
            },
            style: {
                textAlign: 'right',
            },
        },
        {
            id: 'markValue',
            type: 'custom',
            style: {
                paddingLeft: 0,
            },
            hidden: function (items) { return items.every(function (_a) {
                var markValue = _a.markValue;
                return !markValue;
            }); },
            cell: function (_a) {
                var markValue = _a.markValue, formattedMarkValue = _a.formattedMarkValue;
                return (0, common_1.isDefined)(markValue) ? react_1.default.createElement("span", { className: "echTooltip__markValue" },
                    "\u00A0(",
                    formattedMarkValue,
                    ")") : null;
            },
        },
    ];
    var hideActions = ((_g = info === null || info === void 0 ? void 0 : info.disableActions) !== null && _g !== void 0 ? _g : false) || actions.length === 0 || (info === null || info === void 0 ? void 0 : info.values.every(function (v) { return v.displayOnly; }));
    return (react_1.default.createElement(portal_1.TooltipPortal, { scope: "MainTooltip", zIndex: zIndex + 100, anchor: anchorRef !== null && anchorRef !== void 0 ? anchorRef : {
            position: position,
            appendRef: chartRef,
        }, settings: popperSettings, chartId: chartId, visible: visible },
        react_1.default.createElement(tooltip_provider_1.TooltipProvider, { backgroundColor: backgroundColor, dir: isMostlyRTL ? 'rtl' : 'ltr', pinned: pinned, selected: selected, onTooltipPinned: onTooltipPinned, theme: tooltipTheme },
            react_1.default.createElement(tooltip_body_1.TooltipBody, { info: info, columns: columns, headerFormatter: headerFormatter, settings: settings, visible: visible, header: header, footer: footer, onSelect: onTooltipItemSelected, actions: hideActions ? [] : actions, actionPrompt: actionPrompt, selectionPrompt: selectionPrompt }))));
};
exports.TooltipComponent = TooltipComponent;
exports.TooltipComponent.displayName = 'Tooltip';
function getTooltipSettings(tooltip, _a, isExternalTooltipVisible) {
    var externalPointerEvents = _a.externalPointerEvents;
    if (!isExternalTooltipVisible)
        return tooltip;
    return __assign(__assign({}, tooltip), externalPointerEvents.tooltip);
}
var HIDDEN_TOOLTIP_PROPS = {
    tooltip: specs_1.DEFAULT_TOOLTIP_SPEC,
    zIndex: 0,
    visible: false,
    info: undefined,
    position: null,
    settings: {},
    rotation: 0,
    chartId: '',
    backgroundColor: colors_1.Colors.Transparent.keyword,
    pinned: false,
    selected: [],
    tooltipTheme: light_theme_1.LIGHT_THEME.tooltip,
};
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onPointerMove: mouse_1.onPointerMove,
        onTooltipItemSelected: tooltip_1.onTooltipItemSelected,
        onTooltipPinned: tooltip_1.onTooltipPinned,
    }, dispatch);
};
var mapStateToPropsBasic = function (state) {
    var tooltip = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    var _a = (0, get_chart_theme_1.getChartThemeSelector)(state), backgroundColor = _a.background.color, tooltipTheme = _a.tooltip;
    return (0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized
        ? HIDDEN_TOOLTIP_PROPS
        : {
            tooltip: tooltip,
            zIndex: state.zIndex,
            settings: getTooltipSettings(tooltip, (0, get_settings_spec_1.getSettingsSpecSelector)(state), (0, get_internal_is_tooltip_visible_1.getInternalIsTooltipVisibleSelector)(state).isExternal),
            tooltipTheme: tooltipTheme,
            rotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
            chartId: state.chartId,
            backgroundColor: backgroundColor,
        };
};
var mapStateToProps = function (state) {
    return (0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized
        ? HIDDEN_TOOLTIP_PROPS
        : __assign(__assign({}, mapStateToPropsBasic(state)), { visible: (0, get_internal_is_tooltip_visible_1.getInternalIsTooltipVisibleSelector)(state).visible, position: (0, get_internal_tooltip_anchor_position_1.getInternalTooltipAnchorPositionSelector)(state), info: (0, get_internal_tooltip_info_1.getInternalTooltipInfoSelector)(state), pinned: state.interactions.tooltip.pinned, selected: (0, get_tooltip_selected_items_1.getTooltipSelectedItems)(state) });
};
exports.Tooltip = (0, react_1.memo)((0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(exports.TooltipComponent));
exports.BasicTooltip = (0, react_1.memo)((0, react_redux_1.connect)(mapStateToPropsBasic)(exports.TooltipComponent));
//# sourceMappingURL=tooltip.js.map