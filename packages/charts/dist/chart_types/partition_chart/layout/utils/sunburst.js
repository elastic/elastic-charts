"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sunburst = void 0;
var group_by_rollup_1 = require("./group_by_rollup");
function sunburst(outerNodes, areaAccessor, _a, clockwiseSectors, specialFirstInnermostSector, heightStep) {
    var outerX0 = _a.x0, outerY0 = _a.y0;
    if (heightStep === void 0) { heightStep = 1; }
    var result = [];
    var laySubtree = function (nodes, _a, depth) {
        var x0 = _a.x0, y0 = _a.y0;
        var currentOffsetX = x0;
        var nodeCount = nodes.length;
        for (var i = 0; i < nodeCount; i++) {
            var index = clockwiseSectors ? i : nodeCount - i - 1;
            var node = nodes[depth === 1 && specialFirstInnermostSector ? (index + 1) % nodeCount : index];
            var area = areaAccessor(node);
            result.push({ node: node, x0: currentOffsetX, y0: y0, x1: currentOffsetX + area, y1: y0 + heightStep });
            var children = (0, group_by_rollup_1.childrenAccessor)(node);
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