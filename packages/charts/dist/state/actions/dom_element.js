"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDOMElementClick = exports.onDOMElementEnter = exports.onDOMElementLeave = exports.DOMElementType = exports.ON_DOM_ELEMENT_CLICK = exports.ON_DOM_ELEMENT_LEAVE = exports.ON_DOM_ELEMENT_ENTER = void 0;
exports.ON_DOM_ELEMENT_ENTER = 'ON_DOM_ELEMENT_ENTER';
exports.ON_DOM_ELEMENT_LEAVE = 'ON_DOM_ELEMENT_LEAVE';
exports.ON_DOM_ELEMENT_CLICK = 'ON_DOM_ELEMENT_CLICK';
exports.DOMElementType = Object.freeze({
    LineAnnotationMarker: 'LineAnnotationMarker',
});
function onDOMElementLeave() {
    return { type: exports.ON_DOM_ELEMENT_LEAVE };
}
exports.onDOMElementLeave = onDOMElementLeave;
function onDOMElementEnter(element) {
    return { type: exports.ON_DOM_ELEMENT_ENTER, element };
}
exports.onDOMElementEnter = onDOMElementEnter;
function onDOMElementClick() {
    return { type: exports.ON_DOM_ELEMENT_CLICK };
}
exports.onDOMElementClick = onDOMElementClick;
//# sourceMappingURL=dom_element.js.map