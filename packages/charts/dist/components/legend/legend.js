"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Legend = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const custom_legend_1 = require("./custom_legend");
const legend_item_1 = require("./legend_item");
const position_style_1 = require("./position_style");
const style_utils_1 = require("./style_utils");
const specs_1 = require("../../specs");
const colors_1 = require("../../state/actions/colors");
const legend_1 = require("../../state/actions/legend");
const get_chart_theme_1 = require("../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
const get_internal_main_projection_area_1 = require("../../state/selectors/get_internal_main_projection_area");
const get_internal_projection_container_area_1 = require("../../state/selectors/get_internal_projection_container_area");
const get_legend_config_selector_1 = require("../../state/selectors/get_legend_config_selector");
const get_legend_items_1 = require("../../state/selectors/get_legend_items");
const get_legend_items_values_1 = require("../../state/selectors/get_legend_items_values");
const get_legend_size_1 = require("../../state/selectors/get_legend_size");
const get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
const is_brushing_1 = require("../../state/selectors/is_brushing");
const common_1 = require("../../utils/common");
const light_theme_1 = require("../../utils/themes/light_theme");
function LegendComponent(props) {
    var _a;
    const { items, size, debug, isBrushing, chartTheme: { chartMargins, legend }, chartDimensions, containerDimensions, config, } = props;
    if (items.every(({ isItemHidden }) => isItemHidden)) {
        return null;
    }
    const positionConfig = (0, position_style_1.getLegendPositionConfig)(config.legendPosition);
    const containerStyle = (0, style_utils_1.getLegendStyle)(positionConfig, size, legend.margin);
    const listStyle = (0, style_utils_1.getLegendListStyle)(positionConfig, chartMargins, legend, items.length);
    const isMostlyRTL = (0, common_1.hasMostlyRTLItems)(items.map(({ label }) => label));
    const legendClasses = (0, classnames_1.default)('echLegend', {
        'echLegend--debug': debug,
        'echLegend--inert': isBrushing,
        'echLegend--horizontal': positionConfig.direction === common_1.LayoutDirection.Horizontal,
        'echLegend--vertical': positionConfig.direction === common_1.LayoutDirection.Vertical,
        'echLegend--left': positionConfig.hAlign === common_1.HorizontalAlignment.Left,
        'echLegend--right': positionConfig.hAlign === common_1.HorizontalAlignment.Right,
        'echLegend--top': positionConfig.vAlign === common_1.VerticalAlignment.Top,
        'echLegend--bottom': positionConfig.vAlign === common_1.VerticalAlignment.Bottom,
    });
    const itemProps = {
        positionConfig,
        isMostlyRTL,
        totalItems: items.length,
        extraValues: props.extraValues,
        showExtra: config.showLegendExtra,
        onMouseOut: config.onLegendItemOut,
        onMouseOver: config.onLegendItemOver,
        onClick: config.onLegendItemClick,
        clearTemporaryColorsAction: props.clearTemporaryColors,
        setPersistedColorAction: props.setPersistedColor,
        setTemporaryColorAction: props.setTemporaryColor,
        mouseOutAction: props.onItemOutAction,
        mouseOverAction: props.onItemOverAction,
        toggleDeselectSeriesAction: props.onToggleDeselectSeriesAction,
        colorPicker: config.legendColorPicker,
        action: config.legendAction,
        labelOptions: legend.labelOptions,
        flatLegend: (_a = config.flatLegend) !== null && _a !== void 0 ? _a : specs_1.DEFAULT_LEGEND_CONFIG.flatLegend,
    };
    const positionStyle = (0, position_style_1.legendPositionStyle)(config, size, chartDimensions, containerDimensions);
    return (react_1.default.createElement("div", { className: legendClasses, style: positionStyle, dir: isMostlyRTL ? 'rtl' : 'ltr' }, config.customLegend ? (react_1.default.createElement("div", { style: containerStyle },
        react_1.default.createElement(custom_legend_1.CustomLegend, { component: config.customLegend, items: items.map(({ seriesIdentifiers, childId, path, ...customProps }) => {
                var _a, _b, _c;
                return ({
                    ...customProps,
                    seriesIdentifiers,
                    path,
                    extraValue: (_c = itemProps.extraValues.get((_b = (_a = seriesIdentifiers[0]) === null || _a === void 0 ? void 0 : _a.key) !== null && _b !== void 0 ? _b : '')) === null || _c === void 0 ? void 0 : _c.get(childId !== null && childId !== void 0 ? childId : ''),
                    onItemOutAction: itemProps.mouseOutAction,
                    onItemOverActon: () => itemProps.mouseOverAction(path),
                    onItemClickAction: (negate) => itemProps.toggleDeselectSeriesAction(seriesIdentifiers, negate),
                });
            }) }))) : (react_1.default.createElement("div", { style: containerStyle, className: "echLegendListContainer" },
        react_1.default.createElement("ul", { style: listStyle, className: "echLegendList" }, items.map((item, index) => (react_1.default.createElement(legend_item_1.LegendListItem, { key: `${index}`, item: item, ...itemProps }))))))));
}
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onToggleDeselectSeriesAction: legend_1.onToggleDeselectSeriesAction,
    onItemOutAction: legend_1.onLegendItemOutAction,
    onItemOverAction: legend_1.onLegendItemOverAction,
    clearTemporaryColors: colors_1.clearTemporaryColors,
    setTemporaryColor: colors_1.setTemporaryColor,
    setPersistedColor: colors_1.setPersistedColor,
}, dispatch);
const EMPTY_DEFAULT_STATE = {
    chartDimensions: { width: 0, height: 0, left: 0, top: 0 },
    containerDimensions: { width: 0, height: 0, left: 0, top: 0 },
    items: [],
    extraValues: new Map(),
    debug: false,
    isBrushing: false,
    chartTheme: light_theme_1.LIGHT_THEME,
    size: { width: 0, height: 0 },
    config: specs_1.DEFAULT_LEGEND_CONFIG,
};
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return EMPTY_DEFAULT_STATE;
    }
    const config = (0, get_legend_config_selector_1.getLegendConfigSelector)(state);
    if (!config.showLegend) {
        return EMPTY_DEFAULT_STATE;
    }
    const { debug } = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    return {
        debug,
        isBrushing: (0, is_brushing_1.isBrushingSelector)(state),
        chartDimensions: (0, get_internal_main_projection_area_1.getInternalMainProjectionAreaSelector)(state),
        containerDimensions: (0, get_internal_projection_container_area_1.getInternalProjectionContainerAreaSelector)(state),
        chartTheme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        size: (0, get_legend_size_1.getLegendSizeSelector)(state),
        items: (0, get_legend_items_1.getLegendItemsSelector)(state),
        extraValues: (0, get_legend_items_values_1.getLegendExtraValuesSelector)(state),
        config,
    };
};
exports.Legend = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(LegendComponent);
//# sourceMappingURL=legend.js.map