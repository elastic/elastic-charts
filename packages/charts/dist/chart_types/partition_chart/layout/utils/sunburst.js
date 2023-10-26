"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sunburst = void 0;
const group_by_rollup_1 = require("./group_by_rollup");
function sunburst(outerNodes, areaAccessor, { x0: outerX0, y0: outerY0 }, clockwiseSectors, specialFirstInnermostSector, heightStep = 1) {
    const result = [];
    const laySubtree = (nodes, { x0, y0 }, depth) => {
        let currentOffsetX = x0;
        const nodeCount = nodes.length;
        for (let i = 0; i < nodeCount; i++) {
            const index = clockwiseSectors ? i : nodeCount - i - 1;
            const node = nodes[depth === 1 && specialFirstInnermostSector ? (index + 1) % nodeCount : index];
            if (!node)
                continue;
            const area = areaAccessor(node);
            result.push({ node, x0: currentOffsetX, y0, x1: currentOffsetX + area, y1: y0 + heightStep });
            const children = (0, group_by_rollup_1.childrenAccessor)(node);
            if (children.length > 0) {
                laySubtree(children, { x0: currentOffsetX, y0: y0 + heightStep }, depth + 1);
            }
            currentOffsetX += area;
        }
    };
    laySubtree(outerNodes, { x0: outerX0, y0: outerY0 }, 0);
    return result;
}
exports.sunburst = sunburst;
//# sourceMappingURL=sunburst.js.map