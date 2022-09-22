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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenReaderPartitionTable = void 0;
var react_1 = __importStar(require("react"));
var react_redux_1 = require("react-redux");
var get_screen_reader_data_1 = require("../../chart_types/partition_chart/state/selectors/get_screen_reader_data");
var get_accessibility_config_1 = require("../../state/selectors/get_accessibility_config");
var get_internal_is_intialized_1 = require("../../state/selectors/get_internal_is_intialized");
var get_settings_spec_1 = require("../../state/selectors/get_settings_spec");
var common_1 = require("../../utils/common");
var TABLE_PAGINATION = 20;
var ScreenReaderPartitionTableComponent = function (_a) {
    var a11ySettings = _a.a11ySettings, partitionData = _a.partitionData, debug = _a.debug;
    var _b = __read((0, react_1.useState)(1), 2), count = _b[0], setCount = _b[1];
    var tableRowRef = (0, react_1.useRef)(null);
    var tableCaption = a11ySettings.tableCaption;
    var rowLimit = TABLE_PAGINATION * count;
    var handleMoreData = function () {
        setCount(count + 1);
        if (tableRowRef.current) {
            tableRowRef.current.focus();
        }
    };
    var isSmallMultiple = partitionData.isSmallMultiple, data = partitionData.data, hasMultipleLayers = partitionData.hasMultipleLayers;
    var tableLength = data.length;
    var showMoreRows = rowLimit < tableLength;
    var countOfCol = 3;
    var totalColumns = hasMultipleLayers && isSmallMultiple
        ? (countOfCol += 3)
        : hasMultipleLayers || isSmallMultiple
            ? (countOfCol += 2)
            : countOfCol;
    return (react_1.default.createElement("div", { className: "echScreenReaderOnly ".concat(debug ? 'echScreenReaderOnlyDebug' : '', " echScreenReaderTable") },
        react_1.default.createElement("table", null,
            react_1.default.createElement("caption", null, (0, common_1.isNil)(tableCaption)
                ? "The table ".concat(showMoreRows
                    ? "represents only ".concat(rowLimit, " of the ").concat(tableLength, " data points")
                    : "fully represents the dataset of ".concat(tableLength, " data point").concat(tableLength > 1 ? 's' : ''))
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
                .map(function (_a, index) {
                var panelTitle = _a.panelTitle, depth = _a.depth, label = _a.label, parentName = _a.parentName, valueText = _a.valueText, percentage = _a.percentage;
                return (react_1.default.createElement("tr", { key: "row--".concat(index), ref: rowLimit === index ? tableRowRef : undefined, tabIndex: -1 },
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
                        react_1.default.createElement("button", { type: "submit", onClick: function () { return handleMoreData(); }, tabIndex: -1 }, "Click to show more data"))))))));
};
var DEFAULT_SCREEN_READER_SUMMARY = {
    a11ySettings: get_accessibility_config_1.DEFAULT_A11Y_SETTINGS,
    partitionData: {
        isSmallMultiple: false,
        hasMultipleLayers: false,
        data: [],
    },
    debug: false,
};
var mapStateToProps = function (state) {
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