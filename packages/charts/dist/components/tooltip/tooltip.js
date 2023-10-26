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
exports.BasicTooltip = exports.Tooltip = exports.TooltipComponent = void 0;
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const components_1 = require("./components");
const tooltip_provider_1 = require("./components/tooltip_provider");
const placement_1 = require("./placement");
const colors_1 = require("../../common/colors");
const specs_1 = require("../../specs");
const mouse_1 = require("../../state/actions/mouse");
const tooltip_1 = require("../../state/actions/tooltip");
const can_pin_tooltip_1 = require("../../state/selectors/can_pin_tooltip");
const get_chart_rotation_1 = require("../../state/selectors/get_chart_rotation");
const get_chart_theme_1 = require("../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
const get_internal_is_tooltip_visible_1 = require("../../state/selectors/get_internal_is_tooltip_visible");
const get_internal_tooltip_anchor_position_1 = require("../../state/selectors/get_internal_tooltip_anchor_position");
const get_internal_tooltip_info_1 = require("../../state/selectors/get_internal_tooltip_info");
const get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
const get_tooltip_selected_items_1 = require("../../state/selectors/get_tooltip_selected_items");
const get_tooltip_spec_1 = require("../../state/selectors/get_tooltip_spec");
const is_brushing_1 = require("../../state/selectors/is_brushing");
const common_1 = require("../../utils/common");
const light_theme_1 = require("../../utils/themes/light_theme");
const portal_1 = require("../portal");
const TooltipComponent = ({ tooltip: { header: TooltipCustomHeader, body: TooltipCustomBody, footer: TooltipCustomFooter, actions, headerFormatter, actionPrompt, pinningPrompt, selectionPrompt, actionsLoading, noActionsLoaded, maxVisibleTooltipItems, }, anchorRef, info, zIndex, position, getChartContainerRef, settings, tooltipTheme, visible, rotation, chartId, onPointerMove, backgroundColor, pinned, selected, toggleSelectedTooltipItem, setSelectedTooltipItems, pinTooltip, canPinTooltip, isBrushing, }) => {
    var _a, _b, _c, _d, _e;
    const [computedPlacement, setComputedPlacement] = (0, react_1.useState)(settings === null || settings === void 0 ? void 0 : settings.placement);
    const chartRef = getChartContainerRef();
    const handleScroll = (e) => {
        if (e.target &&
            e.target.hasOwnProperty('classList') &&
            e.target.classList.contains('echTooltip__tableBody')) {
            e.stopImmediatePropagation();
            return;
        }
        onPointerMove({ x: -1, y: -1 }, Date.now());
    };
    (0, react_1.useEffect)(() => {
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);
    const popperSettings = (0, react_1.useMemo)(() => {
        var _a;
        if (!settings || typeof settings === 'string') {
            return;
        }
        const { placement, fallbackPlacements, boundary, ...rest } = settings;
        return {
            ...rest,
            placement: placement !== null && placement !== void 0 ? placement : (rotation === 0 || rotation === 180 ? portal_1.Placement.Right : portal_1.Placement.Top),
            fallbackPlacements: fallbackPlacements !== null && fallbackPlacements !== void 0 ? fallbackPlacements : (rotation === 0 || rotation === 180
                ? [portal_1.Placement.Right, portal_1.Placement.Left, portal_1.Placement.Top, portal_1.Placement.Bottom]
                : [portal_1.Placement.Top, portal_1.Placement.Bottom, portal_1.Placement.Right, portal_1.Placement.Left]),
            boundary: boundary === 'chart' ? (_a = chartRef.current) !== null && _a !== void 0 ? _a : undefined : boundary,
        };
    }, [settings, chartRef, rotation]);
    if (!visible || isBrushing) {
        return null;
    }
    const isMostlyRTL = (0, common_1.hasMostlyRTLItems)((_c = (_b = (_a = info === null || info === void 0 ? void 0 : info.values) === null || _a === void 0 ? void 0 : _a.map) === null || _b === void 0 ? void 0 : _b.call(_a, ({ label }) => label)) !== null && _c !== void 0 ? _c : []);
    const textDirectionality = isMostlyRTL ? 'rtl' : 'ltr';
    const columns = [
        {
            id: 'color',
            type: 'color',
        },
        {
            id: 'label',
            type: 'custom',
            truncate: true,
            cell: ({ label }) => (react_1.default.createElement("span", { className: "echTooltip__label", title: label }, label)),
            hidden: (items) => items.every(({ label }) => !label),
            style: {
                textAlign: 'left',
            },
        },
        {
            id: 'value',
            type: 'custom',
            cell: ({ formattedValue }) => (react_1.default.createElement("span", { className: "echTooltip__value", dir: "ltr" }, formattedValue)),
            truncate: true,
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
            hidden: (items) => items.every(({ markValue }) => !markValue),
            cell: ({ markValue, formattedMarkValue }) => (0, common_1.isDefined)(markValue) ? react_1.default.createElement("span", { className: "echTooltip__markValue" },
                "\u00A0(",
                formattedMarkValue,
                ")") : null,
        },
    ];
    if (!info || !visible) {
        return null;
    }
    const hideActions = ((_d = info === null || info === void 0 ? void 0 : info.disableActions) !== null && _d !== void 0 ? _d : false) || (info === null || info === void 0 ? void 0 : info.values.every((v) => v.displayOnly));
    const actionable = actions.length > 0 || !Array.isArray(actions);
    const hasHeader = TooltipCustomHeader !== 'none' && info.header;
    const hasBody = TooltipCustomBody !== 'none' && info.values.length > 0;
    const hasFooter = TooltipCustomFooter !== 'default' && TooltipCustomFooter !== 'none';
    const headerBottomDividerVisibility = hasHeader && (hasBody || hasFooter);
    const bodyBottomDividerVisibility = hasBody && hasFooter;
    return (react_1.default.createElement(portal_1.TooltipPortal, { scope: "MainTooltip", zIndex: zIndex + 100, anchor: anchorRef !== null && anchorRef !== void 0 ? anchorRef : { position, appendRef: chartRef }, settings: popperSettings, chartId: chartId, visible: visible, onPlacementChange: setComputedPlacement },
        react_1.default.createElement(tooltip_provider_1.TooltipProvider, { backgroundColor: backgroundColor, dir: textDirectionality, pinned: pinned, actionable: actionable, canPinTooltip: canPinTooltip, selected: selected, setSelection: setSelectedTooltipItems, toggleSelected: toggleSelectedTooltipItem, values: (_e = info === null || info === void 0 ? void 0 : info.values) !== null && _e !== void 0 ? _e : [], pinTooltip: pinTooltip, theme: tooltipTheme, maxItems: maxVisibleTooltipItems },
            react_1.default.createElement("div", { className: "echTooltip__outerWrapper", style: (0, placement_1.getStylesFromPlacement)(actionable, tooltipTheme, computedPlacement) }, (settings === null || settings === void 0 ? void 0 : settings.customTooltip) ? (react_1.default.createElement(settings.customTooltip, { ...info, dir: textDirectionality, pinned: pinned, selected: selected, setSelection: setSelectedTooltipItems, toggleSelected: toggleSelectedTooltipItem, headerFormatter: headerFormatter, backgroundColor: backgroundColor })) : (react_1.default.createElement(components_1.TooltipWrapper, { actions: hideActions || !canPinTooltip ? [] : actions, actionPrompt: actionPrompt, pinningPrompt: pinningPrompt, selectionPrompt: selectionPrompt, actionsLoading: actionsLoading, noActionsLoaded: noActionsLoaded },
                TooltipCustomHeader === 'none' ? null : TooltipCustomHeader === 'default' ? (react_1.default.createElement(components_1.TooltipHeader, { header: info.header, formatter: headerFormatter })) : (react_1.default.createElement(components_1.TooltipHeader, null,
                    react_1.default.createElement(TooltipCustomHeader, { items: info.values, header: info.header }))),
                headerBottomDividerVisibility && react_1.default.createElement(components_1.TooltipDivider, null),
                TooltipCustomBody === 'none' ? null : TooltipCustomBody === 'default' ? (react_1.default.createElement(components_1.TooltipTable, { columns: columns, items: info.values, pinned: pinned, onSelect: toggleSelectedTooltipItem, selected: selected, maxHeight: (0, components_1.computeTableMaxHeight)(pinned, columns, tooltipTheme.maxTableHeight, maxVisibleTooltipItems) })) : (react_1.default.createElement(TooltipCustomBody, { items: info.values, header: info.header })),
                bodyBottomDividerVisibility && react_1.default.createElement(components_1.TooltipDivider, null),
                TooltipCustomFooter === 'default' || TooltipCustomFooter === 'none' ? null : (react_1.default.createElement(components_1.TooltipFooter, null,
                    react_1.default.createElement(TooltipCustomFooter, { items: info.values, header: info.header })))))))));
};
exports.TooltipComponent = TooltipComponent;
exports.TooltipComponent.displayName = 'Tooltip';
function getTooltipSettings(tooltip, { externalPointerEvents }, isExternalTooltipVisible) {
    if (!isExternalTooltipVisible)
        return tooltip;
    return {
        ...tooltip,
        ...externalPointerEvents.tooltip,
    };
}
const HIDDEN_TOOLTIP_PROPS = {
    tooltip: specs_1.DEFAULT_TOOLTIP_SPEC,
    zIndex: 0,
    visible: false,
    isExternal: false,
    info: undefined,
    position: null,
    settings: {},
    rotation: 0,
    chartId: '',
    canPinTooltip: false,
    backgroundColor: colors_1.Colors.Transparent.keyword,
    pinned: false,
    selected: [],
    tooltipTheme: light_theme_1.LIGHT_THEME.tooltip,
    isBrushing: false,
};
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onPointerMove: mouse_1.onPointerMove,
    toggleSelectedTooltipItem: tooltip_1.toggleSelectedTooltipItem,
    setSelectedTooltipItems: tooltip_1.setSelectedTooltipItems,
    pinTooltip: tooltip_1.pinTooltip,
}, dispatch);
const mapStateToPropsBasic = (state) => {
    const tooltip = (0, get_tooltip_spec_1.getTooltipSpecSelector)(state);
    const { background: { color: backgroundColor }, tooltip: tooltipTheme, } = (0, get_chart_theme_1.getChartThemeSelector)(state);
    const { isExternal } = (0, get_internal_is_tooltip_visible_1.getInternalIsTooltipVisibleSelector)(state);
    return (0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized
        ? HIDDEN_TOOLTIP_PROPS
        : {
            tooltip,
            isExternal,
            isBrushing: false,
            zIndex: state.zIndex,
            settings: getTooltipSettings(tooltip, (0, get_settings_spec_1.getSettingsSpecSelector)(state), isExternal),
            tooltipTheme,
            rotation: (0, get_chart_rotation_1.getChartRotationSelector)(state),
            chartId: state.chartId,
            backgroundColor,
        };
};
const mapStateToProps = (state) => (0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized
    ? HIDDEN_TOOLTIP_PROPS
    : {
        ...mapStateToPropsBasic(state),
        visible: (0, get_internal_is_tooltip_visible_1.getInternalIsTooltipVisibleSelector)(state).visible,
        position: (0, get_internal_tooltip_anchor_position_1.getInternalTooltipAnchorPositionSelector)(state),
        info: (0, get_internal_tooltip_info_1.getInternalTooltipInfoSelector)(state),
        pinned: state.interactions.tooltip.pinned,
        selected: (0, get_tooltip_selected_items_1.getTooltipSelectedItems)(state),
        canPinTooltip: (0, can_pin_tooltip_1.isPinnableTooltip)(state),
        isBrushing: (0, is_brushing_1.isBrushingSelector)(state),
    };
exports.Tooltip = (0, react_1.memo)((0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(exports.TooltipComponent));
exports.BasicTooltip = (0, react_1.memo)((0, react_redux_1.connect)(mapStateToPropsBasic)(exports.TooltipComponent));
//# sourceMappingURL=tooltip.js.map