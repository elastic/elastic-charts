"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShapeViewModel = exports.valueGetterFunction = void 0;
const viewmodel_1 = require("./viewmodel");
const canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
const config_1 = require("../config");
const group_by_rollup_1 = require("../utils/group_by_rollup");
function rawTextGetter(layers) {
    return (node) => {
        var _a;
        const accessorFn = ((_a = layers[node[group_by_rollup_1.DEPTH_KEY] - 1]) === null || _a === void 0 ? void 0 : _a.nodeLabel) || ((d) => d);
        return `${accessorFn(node.dataName)}`;
    };
}
function valueGetterFunction(valueGetter) {
    return typeof valueGetter === 'function' ? valueGetter : config_1.VALUE_GETTERS[valueGetter];
}
exports.valueGetterFunction = valueGetterFunction;
function getShapeViewModel(spec, parentDimensions, tree, backgroundStyle, style, panelModel) {
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)((measureText) => {
        return (0, viewmodel_1.shapeViewModel)(measureText, spec, style, parentDimensions, rawTextGetter(spec.layers), valueGetterFunction(spec.valueGetter), tree, backgroundStyle, panelModel);
    });
}
exports.getShapeViewModel = getShapeViewModel;
//# sourceMappingURL=scenegraph.js.map