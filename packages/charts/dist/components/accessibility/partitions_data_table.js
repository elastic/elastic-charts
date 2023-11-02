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
exports.ScreenReaderPartitionTable = void 0;
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
const get_screen_reader_data_1 = require("../../chart_types/partition_chart/state/selectors/get_screen_reader_data");
const get_accessibility_config_1 = require("../../state/selectors/get_accessibility_config");
const get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
const get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
const common_1 = require("../../utils/common");
const TABLE_PAGINATION = 20;
const ScreenReaderPartitionTableComponent = ({ a11ySettings, partitionData, debug, }) => {
    const [count, setCount] = (0, react_1.useState)(1);
    const tableRowRef = (0, react_1.useRef)(null);
    const { tableCaption } = a11ySettings;
    const rowLimit = TABLE_PAGINATION * count;
    const handleMoreData = () => {
        setCount(count + 1);
        if (tableRowRef.current) {
            tableRowRef.current.focus();
        }
    };
    const { isSmallMultiple, data, hasMultipleLayers } = partitionData;
    const tableLength = data.length;
    const showMoreRows = rowLimit < tableLength;
    let countOfCol = 3;
    const totalColumns = hasMultipleLayers && isSmallMultiple
        ? (countOfCol += 3)
        : hasMultipleLayers || isSmallMultiple
            ? (countOfCol += 2)
            : countOfCol;
    return (react_1.default.createElement("div", { className: `echScreenReaderOnly ${debug ? 'echScreenReaderOnlyDebug' : ''} echScreenReaderTable` },
        react_1.default.createElement("table", null,
            react_1.default.createElement("caption", null, (0, common_1.isNil)(tableCaption)
                ? `The table ${showMoreRows
                    ? `represents only ${rowLimit} of the ${tableLength} data points`
                    : `fully represents the dataset of ${tableLength} data point${tableLength > 1 ? 's' : ''}`}`
                : tableCaption),
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    isSmallMultiple && react_1.default.createElement("th", { scope: "col" }, "Small multiple title"),
                    hasMultipleLayers && react_1.default.createElement("th", { scope: "col" }, "Depth"),
                    react_1.default.createElement("th", { scope: "col" }, "Label"),
                    hasMultipleLayers && react_1.default.createElement("th", { scope: "col" }, "Parent"),
                    react_1.default.createElement("th", { scope: "col" }, "Value"),
                    react_1.default.createElement("th", { scope: "col" }, "Percentage"))),
            react_1.default.createElement("tbody", null, partitionData.data
                .slice(0, rowLimit)
                .map(({ panelTitle, depth, label, parentName, valueText, percentage }, index) => {
                return (react_1.default.createElement("tr", { key: `row--${index}`, ref: rowLimit === index ? tableRowRef : undefined, tabIndex: -1 },
                    isSmallMultiple && react_1.default.createElement("td", null, panelTitle),
                    hasMultipleLayers && react_1.default.createElement("td", null, depth),
                    react_1.default.createElement("th", { scope: "row" }, label),
                    hasMultipleLayers && react_1.default.createElement("td", null, parentName),
                    react_1.default.createElement("td", null, valueText),
                    react_1.default.createElement("td", null, percentage)));
            })),
            showMoreRows && (react_1.default.createElement("tfoot", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("td", { colSpan: totalColumns },
                        react_1.default.createElement("button", { type: "submit", onClick: () => handleMoreData(), tabIndex: -1 }, "Click to show more data"))))))));
};
const DEFAULT_SCREEN_READER_SUMMARY = {
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    partitionData: {
        isSmallMultiple: false,
        hasMultipleLayers: false,
        data: [],
    },
    debug: false,
};
const mapStateToProps = (state) => {
    if ((0, get_internal_is_intialized_1.getInternalIsInitializedSelector)(state) !== get_internal_is_intialized_1.InitStatus.Initialized) {
        return DEFAULT_SCREEN_READER_SUMMARY;
    }
    return {
        a11ySettings: (0, get_accessibility_config_1.getA11ySettingsSelector)(state),
        partitionData: (0, get_screen_reader_data_1.getScreenReaderDataSelector)(state),
        debug: (0, get_settings_spec_1.getSettingsSpecSelector)(state).debug,
    };
};
exports.ScreenReaderPartitionTable = (0, react_1.memo)((0, react_redux_1.connect)(mapStateToProps)(ScreenReaderPartitionTableComponent));
//# sourceMappingURL=partitions_data_table.js.map