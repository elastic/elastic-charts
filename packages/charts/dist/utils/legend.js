"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHierarchicalLegend = exports.isHorizontalLegend = void 0;
var common_1 = require("./common");
var isHorizontalLegend = function (legendPosition) {
    return legendPosition.direction === common_1.LayoutDirection.Horizontal;
};
exports.isHorizontalLegend = isHorizontalLegend;
var isHierarchicalLegend = function (flatLegend, legendPosition) {
    return !flatLegend && !(0, exports.isHorizontalLegend)(legendPosition);
};
exports.isHierarchicalLegend = isHierarchicalLegend;
//# sourceMappingURL=legend.js.map