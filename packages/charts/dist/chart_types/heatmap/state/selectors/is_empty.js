"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmptySelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_heatmap_table_1 = require("./get_heatmap_table");
exports.isEmptySelector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_table_1.getHeatmapTableSelector], function (heatmap) {
    return heatmap.xValues.length === 0 || heatmap.yValues.length === 0;
});
//# sourceMappingURL=is_empty.js.map