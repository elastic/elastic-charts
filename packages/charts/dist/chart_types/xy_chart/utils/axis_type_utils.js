"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHorizontalGrid = exports.isVerticalGrid = exports.isHorizontalAxis = exports.isVerticalAxis = void 0;
const common_1 = require("../../../utils/common");
function isVerticalAxis(axisPosition) {
    return axisPosition === common_1.Position.Left || axisPosition === common_1.Position.Right;
}
exports.isVerticalAxis = isVerticalAxis;
function isHorizontalAxis(axisPosition) {
    return axisPosition === common_1.Position.Top || axisPosition === common_1.Position.Bottom;
}
exports.isHorizontalAxis = isHorizontalAxis;
function isVerticalGrid(axisPosition) {
    return isHorizontalAxis(axisPosition);
}
exports.isVerticalGrid = isVerticalGrid;
function isHorizontalGrid(axisPosition) {
    return isVerticalAxis(axisPosition);
}
exports.isHorizontalGrid = isHorizontalGrid;
//# sourceMappingURL=axis_type_utils.js.map