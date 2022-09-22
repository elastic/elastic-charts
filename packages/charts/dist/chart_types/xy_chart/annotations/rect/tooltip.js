"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRectAnnotationTooltipState = void 0;
var common_1 = require("../../state/utils/common");
var specs_1 = require("../../utils/specs");
var dimensions_1 = require("./dimensions");
function getRectAnnotationTooltipState(cursorPosition, annotationRects, rotation, chartDimensions, specId) {
    for (var i = 0; i < annotationRects.length; i++) {
        var _a = annotationRects[i], rect = _a.rect, panel = _a.panel, datum = _a.datum, id = _a.id;
        var newRect = transformRotateRect(rect, rotation, panel);
        var startX = newRect.x + chartDimensions.left + panel.left;
        var endX = startX + newRect.width;
        var startY = newRect.y + chartDimensions.top + panel.top;
        var endY = startY + newRect.height;
        var bounds = { startX: startX, endX: endX, startY: startY, endY: endY };
        var isWithinBounds = (0, dimensions_1.isWithinRectBounds)(cursorPosition, bounds);
        if (isWithinBounds) {
            return {
                id: id,
                specId: specId,
                isVisible: true,
                annotationType: specs_1.AnnotationType.Rectangle,
                anchor: {
                    x: cursorPosition.x,
                    y: cursorPosition.y,
                    width: 0,
                    height: 0,
                },
                datum: datum,
            };
        }
    }
    return null;
}
exports.getRectAnnotationTooltipState = getRectAnnotationTooltipState;
function transformRotateRect(rect, rotation, dim) {
    var isHorizontalRotated = (0, common_1.isHorizontalRotation)(rotation);
    var width = isHorizontalRotated ? dim.width : dim.height;
    var height = isHorizontalRotated ? dim.height : dim.width;
    switch (rotation) {
        case 90:
            return {
                x: height - rect.height - rect.y,
                y: rect.x,
                width: rect.height,
                height: rect.width,
            };
        case -90:
            return {
                x: rect.y,
                y: width - rect.x - rect.width,
                width: rect.height,
                height: rect.width,
            };
        case 180:
            return {
                x: width - rect.x - rect.width,
                y: height - rect.y - rect.height,
                width: rect.width,
                height: rect.height,
            };
        case 0:
        default:
            return rect;
    }
}
//# sourceMappingURL=tooltip.js.map