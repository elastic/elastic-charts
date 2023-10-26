"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePointerPosition = void 0;
const getActivePointerPosition = ({ interactions }) => {
    var _a, _b;
    return (_b = (_a = interactions.pointer.pinned) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : interactions.pointer.current.position;
};
exports.getActivePointerPosition = getActivePointerPosition;
//# sourceMappingURL=get_active_pointer_position.js.map