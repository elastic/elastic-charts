"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCursorBandPositionSelector = void 0;
var specs_1 = require("../../../../specs");
var create_selector_1 = require("../../../../state/create_selector");
var get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var common_1 = require("../../../../utils/common");
var geometries_1 = require("./geometries");
var getExternalPointerEventStateSelector = function (state) { return state.externalEvents.pointer; };
exports.getCursorBandPositionSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.getHeatmapGeometries, getExternalPointerEventStateSelector, get_active_pointer_position_1.getActivePointerPosition, get_settings_spec_1.getSettingsSpecSelector], getCursorBand);
function getCursorBand(geoms, externalPointerEvent, currentPointerPosition, settings) {
    if (settings.externalPointerEvents.tooltip.visible && (0, specs_1.isPointerOverEvent)(externalPointerEvent)) {
        var x = externalPointerEvent.x;
        if (!(0, common_1.isNil)(x)) {
            var band = geoms.pickCursorBand(x);
            if (band) {
                return __assign(__assign({}, band), { fromExternalEvent: true });
            }
        }
    }
    if (currentPointerPosition.x > -1) {
        var point = currentPointerPosition;
        var end = { x: point.x + Number.EPSILON, y: point.y + Number.EPSILON };
        var band = geoms.pickDragShape([point, end]);
        if (band) {
            return __assign(__assign({}, band), { fromExternalEvent: false });
        }
    }
}
//# sourceMappingURL=get_cursor_band.js.map