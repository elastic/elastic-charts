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
exports.ScreenReaderSummary = void 0;
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const description_1 = require("./description");
const label_1 = require("./label");
const types_1 = require("./types");
const get_goal_chart_data_1 = require("../../chart_types/goal_chart/state/selectors/get_goal_chart_data");
const get_accessibility_config_1 = require("../../state/selectors/get_accessibility_config");
const get_chart_type_description_1 = require("../../state/selectors/get_chart_type_description");
const get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
const ScreenReaderSummaryComponent = ({ a11ySettings, chartTypeDescription, goalChartData, goalChartLabels, }) => {
    return (react_1.default.createElement("div", { className: "echScreenReaderOnly" },
        react_1.default.createElement(label_1.ScreenReaderLabel, { ...a11ySettings, goalChartLabels: goalChartLabels }),
        react_1.default.createElement(description_1.ScreenReaderDescription, { ...a11ySettings }),
        react_1.default.createElement(types_1.ScreenReaderTypes, { ...a11ySettings, chartTypeDescription: chartTypeDescription, goalChartData: goalChartData })));
};
const DEFAULT_SCREEN_READER_SUMMARY = {
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    chartTypeDescription: '',
    goalChartData: undefined,
};
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_SCREEN_READER_SUMMARY;
    }
    return {
        chartTypeDescription: (0, get_chart_type_description_1.getChartTypeDescriptionSelector)(state),
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        goalChartData: (0, get_goal_chart_data_1.getGoalChartDataSelector)(state),
        goalChartLabels: (0, get_goal_chart_data_1.getGoalChartLabelsSelector)(state),
    };
};
exports.ScreenReaderSummary = (0, react_1.memo)((0, react_redux_1.connect)(mapStateToProps)(ScreenReaderSummaryComponent));
//# sourceMappingURL=screen_reader_summary.js.map