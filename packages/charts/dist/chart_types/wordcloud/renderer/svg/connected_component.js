"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wordcloud = void 0;
const d3_cloud_1 = __importDefault(require("d3-cloud"));
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const redux_1 = require("redux");
const accessibility_1 = require("../../../../components/accessibility");
const chart_1 = require("../../../../state/actions/chart");
const get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
const get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
const geometries_1 = require("../../state/selectors/geometries");
function getFont(d) {
    return d.fontFamily;
}
function getFontStyle(d) {
    return d.style;
}
function getFontWeight(d) {
    return d.fontWeight;
}
function getFontSize(d) {
    return d.size;
}
function hashWithinRange(str, max) {
    str = JSON.stringify(str);
    let hash = 0;
    for (const ch of str) {
        hash = (hash * 31 + ch.charCodeAt(0)) % max;
    }
    return Math.abs(hash) % max;
}
function getRotation(startAngle, endAngle, count, text) {
    const angleRange = endAngle - startAngle;
    const angleCount = count !== null && count !== void 0 ? count : 360;
    const interval = count - 1;
    const angleStep = interval === 0 ? 0 : angleRange / interval;
    const index = hashWithinRange(text, angleCount);
    return index * angleStep + startAngle;
}
function exponential(minFontSize, maxFontSize, exponent, weight) {
    return minFontSize + (maxFontSize - minFontSize) * weight ** exponent;
}
function linear(minFontSize, maxFontSize, _exponent, weight) {
    return minFontSize + (maxFontSize - minFontSize) * weight;
}
function squareRoot(minFontSize, maxFontSize, _exponent, weight) {
    return minFontSize + (maxFontSize - minFontSize) * Math.sqrt(weight);
}
function log(minFontSize, maxFontSize, _exponent, weight) {
    return minFontSize + (maxFontSize - minFontSize) * Math.log2(weight + 1);
}
const weightFnLookup = { linear, exponential, log, squareRoot };
function layoutMaker({ data, ...viewModel }, chartSize) {
    var _a, _b;
    const { height, width } = chartSize;
    const words = data.map((d) => {
        const weightFn = weightFnLookup[viewModel.weightFn];
        return {
            datum: d,
            text: d.text,
            color: d.color,
            fontFamily: viewModel.fontFamily,
            style: viewModel.fontStyle,
            fontWeight: viewModel.fontWeight,
            size: weightFn(viewModel.minFontSize, viewModel.maxFontSize, viewModel.exponent, d.weight),
        };
    });
    return (0, d3_cloud_1.default)()
        .random(() => 0.5)
        .size([width, height])
        .words(words)
        .spiral((_a = viewModel.spiral) !== null && _a !== void 0 ? _a : 'archimedean')
        .padding((_b = viewModel.padding) !== null && _b !== void 0 ? _b : 5)
        .rotate((d) => getRotation(viewModel.startAngle, viewModel.endAngle, viewModel.angleCount, d.text))
        .font(getFont)
        .fontStyle(getFontStyle)
        .fontWeight(getFontWeight)
        .fontSize(getFontSize);
}
const View = ({ words, size: { height, width }, actions: { onElementClick, onElementOver, onElementOut }, specId, }) => {
    return (react_1.default.createElement("svg", { width: width, height: height, role: "presentation" },
        react_1.default.createElement("g", { transform: `translate(${width / 2}, ${height / 2})` }, words.map((d, i) => {
            const elements = [[d.datum, { specId, key: specId }]];
            const actions = {
                ...(onElementClick && {
                    onClick: () => {
                        onElementClick(elements);
                    },
                }),
                ...(onElementOver && {
                    onMouseOver: () => {
                        onElementOver(elements);
                    },
                }),
                ...(onElementOut && {
                    onMouseOut: () => {
                        onElementOut();
                    },
                }),
            };
            return (react_1.default.createElement("text", { key: String(i), style: {
                    fontSize: getFontSize(d),
                    fontStyle: getFontStyle(d),
                    fontFamily: getFont(d),
                    fontWeight: getFontWeight(d),
                    fill: d.color,
                }, textAnchor: "middle", transform: `translate(${d.x}, ${d.y}) rotate(${d.rotate})`, ...actions }, d.text));
        }))));
};
class Component extends react_1.default.Component {
    componentDidMount() {
        if (this.props.initialized) {
            this.props.onChartRendered();
        }
    }
    componentDidUpdate() {
        if (this.props.initialized) {
            this.props.onChartRendered();
        }
    }
    render() {
        const { initialized, chartSize, geometries: { wordcloudViewModel, specId }, a11ySettings, onElementClick, onElementOver, onElementOut, } = this.props;
        if (!initialized || chartSize.width === 0 || chartSize.height === 0) {
            return null;
        }
        const layout = layoutMaker(wordcloudViewModel, chartSize);
        let renderedWordObjects = [];
        layout.on('end', (w) => (renderedWordObjects = w)).start();
        const wordCount = wordcloudViewModel.data.length;
        const renderedWordCount = renderedWordObjects.length;
        const notAllWordsFit = wordCount !== renderedWordCount;
        if (notAllWordsFit && wordcloudViewModel.outOfRoomCallback instanceof Function) {
            wordcloudViewModel.outOfRoomCallback(wordCount, renderedWordCount, renderedWordObjects.map((word) => word.text));
        }
        return (react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
            react_1.default.createElement(View, { words: renderedWordObjects, size: chartSize, actions: { onElementClick, onElementOut, onElementOver }, specId: specId }),
            react_1.default.createElement(accessibility_1.ScreenReaderSummary, null)));
    }
}
Component.displayName = 'Wordcloud';
const mapDispatchToProps = (dispatch) => (0, redux_1.bindActionCreators)({
    onChartRendered: chart_1.onChartRendered,
}, dispatch);
const DEFAULT_PROPS = {
    initialized: false,
    geometries: (0, viewmodel_types_1.nullShapeViewModel)(),
    chartSize: {
        width: 0,
        height: 0,
    },
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
};
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_PROPS;
    }
    return {
        initialized: true,
        geometries: (0, geometries_1.geometries)(state),
        chartSize: state.parentDimensions,
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        onElementClick: (0, get_settings_spec_1.getSettingsSpecSelector)(state).onElementClick,
        onElementOver: (0, get_settings_spec_1.getSettingsSpecSelector)(state).onElementOver,
        onElementOut: (0, get_settings_spec_1.getSettingsSpecSelector)(state).onElementOut,
    };
};
exports.Wordcloud = (0, react_redux_1.connect)(mapStateToProps, mapDispatchToProps)(Component);
//# sourceMappingURL=connected_component.js.map