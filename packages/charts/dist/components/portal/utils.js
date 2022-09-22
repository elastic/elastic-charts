"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementZIndex = exports.isHTMLElement = exports.getOrCreateNode = exports.DEFAULT_POPPER_SETTINGS = void 0;
var types_1 = require("./types");
exports.DEFAULT_POPPER_SETTINGS = {
    fallbackPlacements: [types_1.Placement.Right, types_1.Placement.Left, types_1.Placement.Top, types_1.Placement.Bottom],
    placement: types_1.Placement.Right,
    offset: 10,
};
function getOrCreateNode(id, className, parent, zIndex) {
    if (zIndex === void 0) { zIndex = 0; }
    var node = document.getElementById(id);
    if (node) {
        return node;
    }
    var newNode = document.createElement('div');
    newNode.id = id;
    if (className) {
        newNode.classList.add(className);
    }
    newNode.style.zIndex = "".concat(zIndex);
    (parent !== null && parent !== void 0 ? parent : document.body).appendChild(newNode);
    return newNode;
}
exports.getOrCreateNode = getOrCreateNode;
function isHTMLElement(value) {
    return typeof value === 'object' && value !== null && 'nodeName' in value;
}
exports.isHTMLElement = isHTMLElement;
function getElementZIndex(element, cousin) {
    var nodesToInspect = [];
    while (true) {
        nodesToInspect.push(element);
        element = element.offsetParent;
        if (!element) {
            break;
        }
        if (element.contains(cousin)) {
            break;
        }
    }
    for (var i = nodesToInspect.length - 1; i >= 0; i--) {
        var node = nodesToInspect[i];
        var zIndex = window.document.defaultView.getComputedStyle(node).getPropertyValue('z-index');
        var parsedZIndex = parseInt(zIndex, 10);
        if (Number.isFinite(parsedZIndex)) {
            return parsedZIndex;
        }
    }
    return 0;
}
exports.getElementZIndex = getElementZIndex;
//# sourceMappingURL=utils.js.map