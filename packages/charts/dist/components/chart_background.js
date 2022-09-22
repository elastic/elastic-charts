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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartBackground = exports.ChartBackgroundComponent = void 0;
var react_1 = __importDefault(require("react"));
var react_redux_1 = require("react-redux");
var colors_1 = require("../common/colors");
var get_chart_theme_1 = require("../state/selectors/get_chart_theme");
var get_internal_is_intialized_1 = require("../state/selectors/get_internal_is_intialized");
var ChartBackgroundComponent = (function (_super) {
    __extends(ChartBackgroundComponent, _super);
    function ChartBackgroundComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChartBackgroundComponent.prototype.render = function () {
        var backgroundColor = this.props.backgroundColor;
        return react_1.default.createElement("div", { className: "echChartBackground", style: { backgroundColor: backgroundColor } });
    };
    ChartBackgroundComponent.displayName = 'ChartBackground';
    return ChartBackgroundComponent;
}(react_1.default.Component));
exports.ChartBackgroundComponent = ChartBackgroundComponent;
var mapStateToProps = function (state) {
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