"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metric = void 0;
const classnames_1 = __importDefault(require("classnames"));
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const metric_1 = require("./metric");
const color_calcs_1 = require("../../../../common/color_calcs");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const fill_text_color_1 = require("../../../../common/fill_text_color");
const specs_1 = require("../../../../specs");
const chart_1 = require("../../../../state/actions/chart");
const get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
const get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const light_theme_1 = require("../../../../utils/themes/light_theme");
const chart_size_1 = require("../../state/selectors/chart_size");
const data_1 = require("../../state/selectors/data");
const has_chart_titles_1 = require("../../state/selectors/has_chart_titles");
class Component extends react_1.default.Component {
    componentDidMount() {
        this.props.onChartRendered();
    }
    componentDidUpdate() {
        this.props.onChartRendered();
    }
    render() {
        const { chartId, hasTitles, initialized, size: { width, height }, a11y, specs: [spec], style, background, onElementClick, onElementOut, onElementOver, locale, } = this.props;
        if (!initialized || !spec || width === 0 || height === 0) {
            return null;
        }
        const { data } = spec;
        const totalRows = data.length;
        const maxColumns = data.reduce((acc, row) => {
            return Math.max(acc, row.length);
        }, 0);
        const panel = { width: width / maxColumns, height: height / totalRows };
        const backgroundColor = (0, fill_text_color_1.getResolvedBackgroundColor)(background.fallbackColor, background.color);
        const contrastOptions = {
            lightColor: (0, color_library_wrappers_1.colorToRgba)(style.text.lightColor),
            darkColor: (0, color_library_wrappers_1.colorToRgba)(style.text.darkColor),
        };
        const { color: emptyForegroundColor } = (0, color_calcs_1.highContrastColor)((0, color_library_wrappers_1.colorToRgba)(backgroundColor), undefined, contrastOptions);
        return (react_1.default.createElement("ul", { role: "list", className: "echMetricContainer", "aria-labelledby": a11y.labelId, "aria-describedby": a11y.descriptionId, style: {
                gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr)`,
                gridTemplateRows: `repeat(${totalRows}, minmax(${style.minHeight}px, 1fr)`,
            } }, data.flatMap((columns, rowIndex) => {
            return [
                ...columns.map((datum, columnIndex) => {
                    const emptyMetricClassName = (0, classnames_1.default)('echMetric', {
                        'echMetric--rightBorder': columnIndex < maxColumns - 1,
                        'echMetric--bottomBorder': rowIndex < totalRows - 1,
                        'echMetric--topBorder': hasTitles && rowIndex === 0,
                    });
                    return !datum ? (react_1.default.createElement("li", { key: `${columnIndex}-${rowIndex}`, role: "presentation" },
                        react_1.default.createElement("div", { className: emptyMetricClassName, style: { borderColor: style.border } },
                            react_1.default.createElement("div", { className: "echMetricEmpty", style: { borderColor: emptyForegroundColor.keyword } })))) : (react_1.default.createElement("li", { key: `${columnIndex}-${rowIndex}` },
                        react_1.default.createElement(metric_1.Metric, { chartId: chartId, hasTitles: hasTitles, datum: datum, totalRows: totalRows, totalColumns: maxColumns, rowIndex: rowIndex, columnIndex: columnIndex, panel: panel, style: style, backgroundColor: backgroundColor, contrastOptions: contrastOptions, onElementClick: onElementClick, onElementOut: onElementOut, onElementOver: onElementOver, locale: locale })));
                }),
                ...Array.from({ length: maxColumns - columns.length }, (_, zeroBasedColumnIndex) => {
                    const columnIndex = zeroBasedColumnIndex + columns.length;
                    const emptyMetricClassName = (0, classnames_1.default)('echMetric', {
                        'echMetric--bottomBorder': rowIndex < totalRows - 1,
                        'echMetric--topBorder': hasTitles && rowIndex === 0,
                    });
                    return (react_1.default.createElement("li", { key: `missing-${columnIndex}-${rowIndex}`, role: "presentation" },
                        react_1.default.createElement("div", { className: emptyMetricClassName, style: { borderColor: style.border } })));
                }),
            ];
        })));
    }
}
Component.displayName = 'Metric';
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onChartRendered: chart_1.onChartRendered,
}, dispatch);
const DEFAULT_PROPS = {
    initialized: false,
    chartId: '',
    hasTitles: false,
    specs: [],
    size: {
        width: 0,
        height: 0,
    },
    a11y: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    style: light_theme_1.LIGHT_THEME.metric,
    background: light_theme_1.LIGHT_THEME.background,
    locale: specs_1.settingsBuildProps.defaults.locale,
};
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    const { onElementClick, onElementOut, onElementOver, locale } = (0, get_settings_spec_1.getSettingsSpecSelector)(state);
    const { metric: style, background } = (0, get_chart_theme_1.getChartThemeSelector)(state);
    return {
        initialized: true,
        chartId: state.chartId,
        hasTitles: (0, has_chart_titles_1.hasChartTitles)(state),
        specs: (0, data_1.getMetricSpecs)(state),
        size: (0, chart_size_1.chartSize)(state),
        a11y: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        onElementClick,
        onElementOver,
        onElementOut,
        background,
        style,
        locale,
    };
};
exports.Metric = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(Component);
//# sourceMappingURL=index.js.map