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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wordcloud = void 0;
var d3_cloud_1 = __importDefault(require("d3-cloud"));
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var redux_1 = require("redux");
var accessibility_1 = require("../../../../components/accessibility");
var chart_1 = require("../../../../state/actions/chart");
var get_accessibility_config_1 = require("../../../../state/selectors/get_accessibility_config");
var get_internal_is_intialized_1 = require("../../../../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var geometries_1 = require("../../state/selectors/geometries");
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
    var e_1, _a;
    str = JSON.stringify(str);
    var hash = 0;
    try {
        for (var str_1 = __values(str), str_1_1 = str_1.next(); !str_1_1.done; str_1_1 = str_1.next()) {
            var ch = str_1_1.value;
            hash = (hash * 31 + ch.charCodeAt(0)) % max;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (str_1_1 && !str_1_1.done && (_a = str_1.return)) _a.call(str_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Math.abs(hash) % max;
}
function getRotation(startAngle, endAngle, count, text) {
    var angleRange = endAngle - startAngle;
    var angleCount = count !== null && count !== void 0 ? count : 360;
    var interval = count - 1;
    var angleStep = interval === 0 ? 0 : angleRange / interval;
    var index = hashWithinRange(text, angleCount);
    return index * angleStep + startAngle;
}
function exponential(minFontSize, maxFontSize, exponent, weight) {
    return minFontSize + (maxFontSize - minFontSize) * Math.pow(weight, exponent);
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
var weightFnLookup = { linear: linear, exponential: exponential, log: log, squareRoot: squareRoot };
function layoutMaker(_a, chartSize) {
    var _b, _c;
    var data = _a.data, viewModel = __rest(_a, ["data"]);
    var height = chartSize.height, width = chartSize.width;
    var words = data.map(function (d) {
        var weightFn = weightFnLookup[viewModel.weightFn];
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
        .random(function () { return 0.5; })
        .size([width, height])
        .words(words)
        .spiral((_b = viewModel.spiral) !== null && _b !== void 0 ? _b : 'archimedean')
        .padding((_c = viewModel.padding) !== null && _c !== void 0 ? _c : 5)
        .rotate(function (d) { return getRotation(viewModel.startAngle, viewModel.endAngle, viewModel.angleCount, d.text); })
        .font(getFont)
        .fontStyle(getFontStyle)
        .fontWeight(getFontWeight)
        .fontSize(getFontSize);
}
var View = function (_a) {
    var words = _a.words, _b = _a.size, height = _b.height, width = _b.width, _c = _a.actions, onElementClick = _c.onElementClick, onElementOver = _c.onElementOver, onElementOut = _c.onElementOut, specId = _a.specId;
    return (react_1.default.createElement("svg", { width: width, height: height, role: "presentation" },
        react_1.default.createElement("g", { transform: "translate(".concat(width / 2, ", ").concat(height / 2, ")") }, words.map(function (d, i) {
            var elements = [[d.datum, { specId: specId, key: specId }]];
            var actions = __assign(__assign(__assign({}, (onElementClick && {
                onClick: function () {
                    onElementClick(elements);
                },
            })), (onElementOver && {
                onMouseOver: function () {
                    onElementOver(elements);
                },
            })), (onElementOut && {
                onMouseOut: function () {
                    onElementOut();
                },
            }));
            return (react_1.default.createElement("text", __assign({ key: String(i), style: {
                    fontSize: getFontSize(d),
                    fontStyle: getFontStyle(d),
                    fontFamily: getFont(d),
                    fontWeight: getFontWeight(d),
                    fill: d.color,
                }, textAnchor: "middle", transform: "translate(".concat(d.x, ", ").concat(d.y, ") rotate(").concat(d.rotate, ")") }, actions), d.text));
        }))));
};
var Component = (function (_super) {
    __extends(Component, _super);
    function Component() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Component.prototype.componentDidMount = function () {
        if (this.props.initialized) {
            this.props.onChartRendered();
        }
    };
    Component.prototype.componentDidUpdate = function () {
        if (this.props.initialized) {
            this.props.onChartRendered();
        }
    };
    Component.prototype.render = function () {
        var _a = this.props, initialized = _a.initialized, chartSize = _a.chartSize, _b = _a.geometries, wordcloudViewModel = _b.wordcloudViewModel, specId = _b.specId, a11ySettings = _a.a11ySettings, onElementClick = _a.onElementClick, onElementOver = _a.onElementOver, onElementOut = _a.onElementOut;
        if (!initialized || chartSize.width === 0 || chartSize.height === 0) {
            return null;
        }
        var layout = layoutMaker(wordcloudViewModel, chartSize);
        var renderedWordObjects = [];
        layout.on('end', function (w) { return (renderedWordObjects = w); }).start();
        var wordCount = wordcloudViewModel.data.length;
        var renderedWordCount = renderedWordObjects.length;
        var notAllWordsFit = wordCount !== renderedWordCount;
        if (notAllWordsFit && wordcloudViewModel.outOfRoomCallback instanceof Function) {
            wordcloudViewModel.outOfRoomCallback(wordCount, renderedWordCount, renderedWordObjects.map(function (word) { return word.text; }));
        }
        return (react_1.default.createElement("figure", { "aria-labelledby": a11ySettings.labelId, "aria-describedby": a11ySettings.descriptionId },
            react_1.default.createElement(View, { words: renderedWordObjects, size: chartSize, actions: { onElementClick: onElementClick, onElementOut: onElementOut, onElementOver: onElementOver }, specId: specId }),
            react_1.default.createElement(accessibility_1.ScreenReaderSummary, null)));
    };
    Component.displayName = 'Wordcloud';
    return Component;
}(react_1.default.Component));
var mapDispatchToProps = function (dispatch) {
    return (0, redux_1.bindActionCreators)({
        onChartRendered: chart_1.onChartRendered,
    }, dispatch);
};
var DEFAULT_PROPS = {
    initialized: false,
    geometries: (0, viewmodel_types_1.nullShapeViewModel)(),
    chartSize: {
        width: 0,
        height: 0,
    },
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
};
var mapStateToProps = function (state) {
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