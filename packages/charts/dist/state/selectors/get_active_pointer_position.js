"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivePointerPosition = void 0;
var getActivePointerPosition = function (_a) {
    var _b, _c;
    var interactions = _a.interactions;
    return (_c = (_b = interactions.pointer.pinned) === null || _b === void 0 ? void 0 : _b.position) !== null && _c !== void 0 ? _c : interactions.pointer.current.position;
};
exports.getActivePointerPosition = getActivePointerPosition;
//# sourceMappingURL=get_active_pointer_position.js.map