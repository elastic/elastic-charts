"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickShapesLayerValues = exports.pickedShapes = void 0;
var config_1 = require("../config");
var group_by_rollup_1 = require("../utils/group_by_rollup");
var pickedShapes = function (models, _a, foci) {
    var x = _a.x, y = _a.y;
    return models.flatMap(function (_a) {
        var diskCenter = _a.diskCenter, pickQuads = _a.pickQuads;
        return pickQuads(x - diskCenter.x, y - diskCenter.y, foci[0]);
    });
};
exports.pickedShapes = pickedShapes;
function pickShapesLayerValues(shapes) {
    var maxDepth = shapes.reduce(function (acc, curr) { return Math.max(acc, curr.depth); }, 0);
    return shapes
        .filter(function (_a) {
        var depth = _a.depth;
        return depth === maxDepth;
    })
        .map(function (viewModel) {
        var values = [
            {
                smAccessorValue: viewModel.smAccessorValue,
                groupByRollup: viewModel.dataName,
                value: viewModel[group_by_rollup_1.AGGREGATE_KEY],
                depth: viewModel[group_by_rollup_1.DEPTH_KEY],
                sortIndex: viewModel[group_by_rollup_1.SORT_INDEX_KEY],
                path: viewModel[group_by_rollup_1.PATH_KEY],
            },
        ];
        var node = viewModel[config_1.MODEL_KEY];
        while (node[group_by_rollup_1.DEPTH_KEY] > 0) {
            var value = node[group_by_rollup_1.AGGREGATE_KEY];
            var dataName = (0, group_by_rollup_1.getNodeName)(node);
            values.push({
                smAccessorValue: viewModel.smAccessorValue,
                groupByRollup: dataName,
                value: value,
                depth: node[group_by_rollup_1.DEPTH_KEY],
                sortIndex: node[group_by_rollup_1.SORT_INDEX_KEY],
                path: node[group_by_rollup_1.PATH_KEY],
            });
            node = node[group_by_rollup_1.PARENT_KEY];
        }
        return values.reverse();
    });
}
exports.pickShapesLayerValues = pickShapesLayerValues;
//# sourceMappingURL=picked_shapes.js.map