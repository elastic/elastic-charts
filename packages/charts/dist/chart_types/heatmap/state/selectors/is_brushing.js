"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrushingSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var getPointerSelector = function (state) { return state.interactions.pointer; };
exports.isBrushingSelector = (0, create_selector_1.createCustomCachedSelector)([getPointerSelector], function (pointer) {
    return pointer.dragging;
});
//# sourceMappingURL=is_brushing.js.map