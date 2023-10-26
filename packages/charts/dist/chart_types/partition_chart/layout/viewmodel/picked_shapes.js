"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickShapesTooltipValues = exports.pickShapesLayerValues = exports.pickedShapes = void 0;
const viewmodel_1 = require("./viewmodel");
const config_1 = require("../config");
const group_by_rollup_1 = require("../utils/group_by_rollup");
const pickedShapes = (models, { x, y }, [focus]) => focus ? models.flatMap(({ diskCenter, pickQuads }) => pickQuads(x - diskCenter.x, y - diskCenter.y, focus)) : [];
exports.pickedShapes = pickedShapes;
function pickShapesLayerValues(shapes) {
    const maxDepth = shapes.reduce((acc, curr) => Math.max(acc, curr.depth), 0);
    return shapes
        .filter(({ depth }) => depth === maxDepth)
        .map((viewModel) => {
        const values = [
            {
                smAccessorValue: viewModel.smAccessorValue,
                groupByRollup: viewModel.dataName,
                value: viewModel[group_by_rollup_1.AGGREGATE_KEY],
                depth: viewModel[group_by_rollup_1.DEPTH_KEY],
                sortIndex: viewModel[group_by_rollup_1.SORT_INDEX_KEY],
                path: viewModel[group_by_rollup_1.PATH_KEY],
            },
        ];
        let node = viewModel[config_1.MODEL_KEY];
        while (node[group_by_rollup_1.DEPTH_KEY] > 0) {
            const value = node[group_by_rollup_1.AGGREGATE_KEY];
            const dataName = (0, group_by_rollup_1.getNodeName)(node);
            values.push({
                smAccessorValue: viewModel.smAccessorValue,
                groupByRollup: dataName,
                value,
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
function pickShapesTooltipValues(shapes, shapeViewModel, valueFormatter, percentFormatter, id) {
    const maxDepth = shapes.reduce((acc, curr) => Math.max(acc, curr.depth), 0);
    const currentShapeViewModel = shapeViewModel.find((d) => { var _a; return d.smAccessorValue === ((_a = shapes[0]) === null || _a === void 0 ? void 0 : _a.smAccessorValue); });
    if (!currentShapeViewModel) {
        return { values: [], header: null };
    }
    const labelFormatters = currentShapeViewModel.layers.map((d) => d.nodeLabel);
    return {
        header: null,
        values: shapes
            .filter(({ depth }) => depth === maxDepth)
            .flatMap((viewModel) => {
            const entryNode = viewModel[group_by_rollup_1.PARENT_KEY][group_by_rollup_1.CHILDREN_KEY][viewModel[group_by_rollup_1.SORT_INDEX_KEY]];
            if (!entryNode)
                return [];
            const values = [
                getTooltipValueFromNode((0, group_by_rollup_1.entryValue)(entryNode), labelFormatters, valueFormatter, percentFormatter, currentShapeViewModel, id),
            ];
            if ((0, viewmodel_1.isLinear)(currentShapeViewModel.layout)) {
                return values;
            }
            let node = viewModel[config_1.MODEL_KEY];
            while (node[group_by_rollup_1.DEPTH_KEY] > 0) {
                values.push(getTooltipValueFromNode(node, labelFormatters, valueFormatter, percentFormatter, currentShapeViewModel, id));
                node = node[group_by_rollup_1.PARENT_KEY];
            }
            return values.reverse();
        }),
    };
}
exports.pickShapesTooltipValues = pickShapesTooltipValues;
function getTooltipValueFromNode(node, labelFormatters, valueFormatter, percentFormatter, shapeViewModel, id) {
    var _a, _b;
    const depth = node[group_by_rollup_1.DEPTH_KEY];
    const value = node[group_by_rollup_1.AGGREGATE_KEY];
    const dataName = (0, group_by_rollup_1.getNodeName)(node);
    const formatter = labelFormatters[depth - 1];
    const model = shapeViewModel.quadViewModel.find((d) => d.depth === depth && d.dataName === dataName && d.value === value);
    return {
        label: formatter ? formatter(dataName) : dataName,
        color: (_a = model === null || model === void 0 ? void 0 : model.fillColor) !== null && _a !== void 0 ? _a : 'transparent',
        isHighlighted: false,
        isVisible: true,
        seriesIdentifier: {
            specId: id,
            key: (_b = model === null || model === void 0 ? void 0 : model.dataName) !== null && _b !== void 0 ? _b : '',
        },
        value: node[group_by_rollup_1.AGGREGATE_KEY],
        formattedValue: `${valueFormatter(value)}\u00A0(${percentFormatter((0, config_1.percentValueGetter)(node))})`,
        valueAccessor: node[group_by_rollup_1.DEPTH_KEY],
    };
}
//# sourceMappingURL=picked_shapes.js.map