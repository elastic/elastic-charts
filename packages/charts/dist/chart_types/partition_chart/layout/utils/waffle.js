"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waffle = void 0;
var group_by_rollup_1 = require("./group_by_rollup");
var rowCount = 10;
var columnCount = 10;
function waffle(tree, totalValue, _a) {
    var outerX0 = _a.x0, outerY0 = _a.y0, outerWidth = _a.width, outerHeight = _a.height;
    var size = Math.min(outerWidth, outerHeight);
    var widthOffset = Math.max(0, outerWidth - size) / 2;
    var heightOffset = Math.max(0, outerHeight - size) / 2;
    var rowHeight = size / rowCount;
    var columnWidth = size / columnCount;
    var cellCount = rowCount * columnCount;
    var valuePerCell = totalValue / cellCount;
    var valueSoFar = 0;
    var lastIndex = 0;
    var root = tree[0];
    return __spreadArray([
        { node: root, x0: 0, y0: 0, x1: size, y1: size }
    ], __read(root[1][group_by_rollup_1.CHILDREN_KEY].flatMap(function (entry) {
        var _a = __read(entry, 2), value = _a[1].value;
        valueSoFar += value;
        var toIndex = Math.round(valueSoFar / valuePerCell);
        var cells = [];
        for (var i = lastIndex; i < toIndex; i++) {
            var columnIndex = i % columnCount;
            var rowIndex = (i - columnIndex) / columnCount;
            var x0 = outerX0 + widthOffset + columnIndex * columnWidth;
            var y0 = outerY0 + heightOffset + rowIndex * rowHeight;
            cells.push({
                node: entry,
                x0: x0,
                y0: y0,
                x1: x0 + columnWidth,
                y1: y0 + rowHeight,
            });
        }
        lastIndex = toIndex;
        return cells;
    })), false);
}
exports.waffle = waffle;
//# sourceMappingURL=waffle.js.map