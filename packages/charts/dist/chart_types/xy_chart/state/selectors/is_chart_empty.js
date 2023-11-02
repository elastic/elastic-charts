"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChartEmptySelector = void 0;
const compute_legend_1 = require("./compute_legend");
const create_selector_1 = require("../../../../state/create_selector");
const common_1 = require("../utils/common");
exports.isChartEmptySelector = (0, create_selector_1.createCustomCachedSelector)([compute_legend_1.computeLegendSelector], (legendItems) => (0, common_1.isAllSeriesDeselected)(legendItems));
//# sourceMappingURL=is_chart_empty.js.map