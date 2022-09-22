"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrushingSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var is_brush_available_1 = require("./is_brush_available");
var getPointerSelector = function (state) { return state.interactions.pointer; };
exports.isBrushingSelector = (0, create_selector_1.createCustomCachedSelector)([is_brush_available_1.isBrushAvailableSelector, getPointerSelector], function (isBrushAvailable, pointer) { return isBrushAvailable && pointer.dragging; });
//# sourceMappingURL=is_brushing.js.map