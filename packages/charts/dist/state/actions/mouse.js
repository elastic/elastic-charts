"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPointerMove = exports.onMouseUp = exports.onMouseDown = exports.onMouseRightClick = exports.ON_MOUSE_RIGHT_CLICK = exports.ON_MOUSE_UP = exports.ON_MOUSE_DOWN = exports.ON_POINTER_MOVE = void 0;
exports.ON_POINTER_MOVE = 'ON_POINTER_MOVE';
exports.ON_MOUSE_DOWN = 'ON_MOUSE_DOWN';
exports.ON_MOUSE_UP = 'ON_MOUSE_UP';
exports.ON_MOUSE_RIGHT_CLICK = 'ON_MOUSE_RIGHT_CLICK';
function onMouseRightClick(position, time) {
    return { type: exports.ON_MOUSE_RIGHT_CLICK, position: position, time: time };
}
exports.onMouseRightClick = onMouseRightClick;
function onMouseDown(position, time) {
    return { type: exports.ON_MOUSE_DOWN, position: position, time: time };
}
exports.onMouseDown = onMouseDown;
function onMouseUp(position, time) {
    return { type: exports.ON_MOUSE_UP, position: position, time: time };
}
exports.onMouseUp = onMouseUp;
function onPointerMove(position, time) {
    return { type: exports.ON_POINTER_MOVE, position: position, time: time };
}
exports.onPointerMove = onPointerMove;
//# sourceMappingURL=mouse.js.map