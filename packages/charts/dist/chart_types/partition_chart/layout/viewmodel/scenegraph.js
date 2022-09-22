"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShapeViewModel = exports.valueGetterFunction = void 0;
var canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
var config_1 = require("../config");
var group_by_rollup_1 = require("../utils/group_by_rollup");
var viewmodel_1 = require("./viewmodel");
function rawTextGetter(layers) {
    return function (node) {
        var accessorFn = layers[node[group_by_rollup_1.DEPTH_KEY] - 1].nodeLabel || (function (d) { return d; });
        return "".concat(accessorFn(node.dataName));
    };
}
function valueGetterFunction(valueGetter) {
    return typeof valueGetter === 'function' ? valueGetter : config_1.VALUE_GETTERS[valueGetter];
}
exports.valueGetterFunction = valueGetterFunction;
function getShapeViewModel(spec, parentDimensions, tree, backgroundStyle, style, panelModel) {
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)(function (measureText) {
        return (0, viewmodel_1.shapeViewModel)(measureText, spec, style, parentDimensions, rawTextGetter(spec.layers), valueGetterFunction(spec.valueGetter), tree, backgroundStyle, panelModel);
    });
}
exports.getShapeViewModel = getShapeViewModel;
//# sourceMappingURL=scenegraph.js.map