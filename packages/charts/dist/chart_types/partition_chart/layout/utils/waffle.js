"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waffle = void 0;
const group_by_rollup_1 = require("./group_by_rollup");
const rowCount = 10;
const columnCount = 10;
function waffle(tree, totalValue, { x0: outerX0, y0: outerY0, width: outerWidth, height: outerHeight, }) {
    const root = tree[0];
    if (!root || !root[1])
        return [];
    const size = Math.min(outerWidth, outerHeight);
    const widthOffset = Math.max(0, outerWidth - size) / 2;
    const heightOffset = Math.max(0, outerHeight - size) / 2;
    const rowHeight = size / rowCount;
    const columnWidth = size / columnCount;
    const cellCount = rowCount * columnCount;
    const valuePerCell = totalValue / cellCount;
    let valueSoFar = 0;
    let lastIndex = 0;
    return [
        { node: root, x0: 0, y0: 0, x1: size, y1: size },
        ...root[1][group_by_rollup_1.CHILDREN_KEY].flatMap((entry) => {
            const [, { value }] = entry;
            valueSoFar += value;
            const toIndex = Math.round(valueSoFar / valuePerCell);
            const cells = [];
            for (let i = lastIndex; i < toIndex; i++) {
                const columnIndex = i % columnCount;
                const rowIndex = (i - columnIndex) / columnCount;
                const x0 = outerX0 + widthOffset + columnIndex * columnWidth;
                const y0 = outerY0 + heightOffset + rowIndex * rowHeight;
                cells.push({
                    node: entry,
                    x0,
                    y0,
                    x1: x0 + columnWidth,
                    y1: y0 + rowHeight,
                });
            }
            lastIndex = toIndex;
            return cells;
        }),
    ];
}
exports.waffle = waffle;
//# sourceMappingURL=waffle.js.map