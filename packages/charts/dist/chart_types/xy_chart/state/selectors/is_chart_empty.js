"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChartEmptySelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var common_1 = require("../utils/common");
var compute_legend_1 = require("./compute_legend");
exports.isChartEmptySelector = (0, create_selector_1.createCustomCachedSelector)([compute_legend_1.computeLegendSelector], function (legendItems) {
    return (0, common_1.isAllSeriesDeselected)(legendItems);
});
//# sourceMappingURL=is_chart_empty.js.map