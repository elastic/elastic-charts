"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Legend = void 0;
var classnames_1 = __importDefault(require("classnames"));
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var specs_1 = require("../../specs");
var colors_1 = require("../../state/actions/colors");
var legend_1 = require("../../state/actions/legend");
var get_chart_theme_1 = require("../../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
var get_internal_main_projection_area_1 = require("../../state/selectors/get_internal_main_projection_area");
var get_internal_projection_container_area_1 = require("../../state/selectors/get_internal_projection_container_area");
var get_legend_config_selector_1 = require("../../state/selectors/get_legend_config_selector");
var get_legend_items_1 = require("../../state/selectors/get_legend_items");
var get_legend_items_values_1 = require("../../state/selectors/get_legend_items_values");
var get_legend_size_1 = require("../../state/selectors/get_legend_size");
var get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
var common_1 = require("../../utils/common");
var light_theme_1 = require("../../utils/themes/light_theme");
var legend_item_1 = require("./legend_item");
var position_style_1 = require("./position_style");
var style_utils_1 = require("./style_utils");
function LegendComponent(props) {
    var items = props.items, size = props.size, debug = props.debug, _a = props.chartTheme, chartMargins = _a.chartMargins, legend = _a.legend, chartDimensions = props.chartDimensions, containerDimensions = props.containerDimensions, config = props.config;
    if (items.every(function (_a) {
        var isItemHidden = _a.isItemHidden;
        return isItemHidden;
    })) {
        return null;
    }
    var positionConfig = (0, position_style_1.getLegendPositionConfig)(config.legendPosition);
    var containerStyle = (0, style_utils_1.getLegendStyle)(positionConfig, size, legend.margin);
    var listStyle = (0, style_utils_1.getLegendListStyle)(positionConfig, chartMargins, legend, items.length);
    var isMostlyRTL = (0, common_1.hasMostlyRTLItems)(items.map(function (_a) {
        var label = _a.label;
        return label;
    }));
    var legendClasses = (0, classnames_1.default)('echLegend', {
        'echLegend--debug': debug,
        'echLegend--horizontal': positionConfig.direction === common_1.LayoutDirection.Horizontal,
        'echLegend--vertical': positionConfig.direction === common_1.LayoutDirection.Vertical,
        'echLegend--left': positionConfig.hAlign === common_1.HorizontalAlignment.Left,
        'echLegend--right': positionConfig.hAlign === common_1.HorizontalAlignment.Right,
        'echLegend--top': positionConfig.vAlign === common_1.VerticalAlignment.Top,
        'echLegend--bottom': positionConfig.vAlign === common_1.VerticalAlignment.Bottom,
    });
    var itemProps = {
        positionConfig: positionConfig,
        isMostlyRTL: isMostlyRTL,
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
    };
    var positionStyle = (0, position_style_1.legendPositionStyle)(config, size, chartDimensions, containerDimensions);
    return (react_1.default.createElement("div", { className: legendClasses, style: positionStyle, dir: isMostlyRTL ? 'rtl' : 'ltr' },
        react_1.default.createElement("div", { style: containerStyle, className: "echLegendListContainer" },
            react_1.default.createElement("ul", { style: listStyle, className: "echLegendList" }, items.map(function (item, index) { return (0, legend_item_1.renderLegendItem)(item, itemProps, index); })))));
}
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onToggleDeselectSeriesAction: legend_1.onToggleDeselectSeriesAction,
        onItemOutAction: legend_1.onLegendItemOutAction,
        onItemOverAction: legend_1.onLegendItemOverAction,
        clearTemporaryColors: colors_1.clearTemporaryColors,
        setTemporaryColor: colors_1.setTemporaryColor,
        setPersistedColor: colors_1.setPersistedColor,
    }, dispatch);
};
var EMPTY_DEFAULT_STATE = {
    chartDimensions: { width: 0, height: 0, left: 0, top: 0 },
    containerDimensions: { width: 0, height: 0, left: 0, top: 0 },
    items: [],
    extraValues: new Map(),
    debug: false,
    chartTheme: light_theme_1.LIGHT_THEME,
    size: { width: 0, height: 0 },
    config: specs_1.DEFAULT_LEGEND_CONFIG,
};
var mapStateToProps = function (state) {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return EMPTY_DEFAULT_STATE;
    }
    var config = (0, get_legend_config_selector_1.getLegendConfigSelector)(state);
    if (!config.showLegend) {
        return EMPTY_DEFAULT_STATE;
    }
    var debug = (0, get_settings_spec_1.getSettingsSpecSelector)(state).debug;
    return {
        debug: debug,
        chartDimensions: (0, get_internal_main_projection_area_1.getInternalMainProjectionAreaSelector)(state),
        containerDimensions: (0, get_internal_projection_container_area_1.getInternalProjectionContainerAreaSelector)(state),
        chartTheme: (0, get_chart_theme_1.getChartThemeSelector)(state),
        size: (0, get_legend_size_1.getLegendSizeSelector)(state),
        items: (0, get_legend_items_1.getLegendItemsSelector)(state),
        extraValues: (0, get_legend_items_values_1.getLegendExtraValuesSelector)(state),
        config: config,
    };
};
exports.Legend = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(LegendComponent);
//# sourceMappingURL=legend.js.map