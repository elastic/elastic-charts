"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartBackground = exports.ChartBackgroundComponent = void 0;
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const colors_1 = require("../common/colors");
const get_chart_theme_1 = require("../state/selectors/get_chart_theme");
const get_internal_is_intialized_1 = require("../state/selectors/get_internal_is_intialized");
class ChartBackgroundComponent extends react_1.default.Component {
    render() {
        const { backgroundColor } = this.props;
        return react_1.default.createElement("div", { className: "echChartBackground", style: { backgroundColor } });
    }
}
exports.ChartBackgroundComponent = ChartBackgroundComponent;
ChartBackgroundComponent.displayName = 'ChartBackground';
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return {
            backgroundColor: colors_1.Colors.Transparent.keyword,
        };
    }
    return {
        backgroundColor: (0, get_chart_theme_1.getChartThemeSelector)(state).background.color,
    };
};
exports.ChartBackground = (0, react_redux_1.connect)(mapStateToProps)(ChartBackgroundComponent);
//# sourceMappingURL=chart_background.js.map