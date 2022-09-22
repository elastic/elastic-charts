"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickedShapesLayerValues = exports.getPickedShapes = exports.getCaptureBoundingBox = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var geoms_1 = require("../../layout/viewmodel/geoms");
var get_active_pointer_position_1 = require("./../../../../state/selectors/get_active_pointer_position");
var geometries_1 = require("./geometries");
function fullBoundingBox(ctx, geoms) {
    var e_1, _a, e_2, _b;
    var box = (0, geoms_1.initialBoundingBox)();
    if (ctx) {
        try {
            for (var geoms_2 = __values(geoms), geoms_2_1 = geoms_2.next(); !geoms_2_1.done; geoms_2_1 = geoms_2.next()) {
                var g = geoms_2_1.value;
                try {
                    for (var _c = (e_2 = void 0, __values(g.boundingBoxes(ctx))), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = _d.value, x0 = _e.x0, y0 = _e.y0, x1 = _e.x1, y1 = _e.y1;
                        box.x0 = Math.min(box.x0, x0, x1);
                        box.y0 = Math.min(box.y0, y0, y1);
                        box.x1 = Math.max(box.x1, x0, x1);
                        box.y1 = Math.max(box.y1, y0, y1);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (geoms_2_1 && !geoms_2_1.done && (_a = geoms_2.return)) _a.call(geoms_2);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return box;
}
exports.getCaptureBoundingBox = (0, create_selector_1.createCustomCachedSelector)([geometries_1.getPrimitiveGeoms], function (geoms) {
    var textMeasurer = document.createElement('canvas');
    var ctx = textMeasurer.getContext('2d');
    return fullBoundingBox(ctx, geoms);
});
exports.getPickedShapes = (0, create_selector_1.createCustomCachedSelector)([geometries_1.geometries, get_active_pointer_position_1.getActivePointerPosition, exports.getCaptureBoundingBox], function (geoms, pointerPosition, capture) {
    var picker = geoms.pickQuads;
    var chartCenter = geoms.chartCenter;
    var x = pointerPosition.x, y = pointerPosition.y;
    return capture.x0 <= x && x <= capture.x1 && capture.y0 <= y && y <= capture.y1
        ? picker(x - chartCenter.x, y - chartCenter.y)
        : [];
});
exports.getPickedShapesLayerValues = (0, create_selector_1.createCustomCachedSelector)([exports.getPickedShapes], function (pickedShapes) {
    return pickedShapes.map(function (model) {
        var values = [];
        values.push({
            smAccessorValue: '',
            groupByRollup: 'Actual',
            value: model.actual,
            sortIndex: 0,
            path: [],
            depth: 0,
        });
        return values.reverse();
    });
});
//# sourceMappingURL=picked_shapes.js.map