"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipAnchorSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var picked_shapes_1 = require("./picked_shapes");
exports.getTooltipAnchorSelector = (0, create_selector_1.createCustomCachedSelector)([picked_shapes_1.getPickedShapes, compute_chart_dimensions_1.computeChartElementSizesSelector, get_active_pointer_position_1.getActivePointerPosition], function (shapes, _a, position) {
    var grid = _a.grid;
    if (Array.isArray(shapes) && shapes.length > 0) {
        var firstShape = shapes[0];
        return {
            x: firstShape.x + grid.left,
            width: firstShape.width,
            y: firstShape.y - grid.top,
            height: firstShape.height,
        };
    }
    return {
        x: position.x,
        width: 0,
        y: position.y,
        height: 0,
    };
});
//# sourceMappingURL=get_tooltip_anchor.js.map