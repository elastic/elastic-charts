"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHierarchicalLegend = exports.isHorizontalLegend = void 0;
const common_1 = require("./common");
const isHorizontalLegend = (legendPosition) => legendPosition.direction === common_1.LayoutDirection.Horizontal;
exports.isHorizontalLegend = isHorizontalLegend;
const isHierarchicalLegend = (flatLegend, legendPosition) => !flatLegend && !(0, exports.isHorizontalLegend)(legendPosition);
exports.isHierarchicalLegend = isHierarchicalLegend;
//# sourceMappingURL=legend.js.map