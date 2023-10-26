"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRectAnnotationTooltipState = void 0;
const dimensions_1 = require("./dimensions");
const common_1 = require("../../state/utils/common");
const specs_1 = require("../../utils/specs");
function getRectAnnotationTooltipState(cursorPosition, annotationRects, rotation, chartDimensions, specId) {
    for (const annotationRect of annotationRects) {
        const { rect, panel, datum, id } = annotationRect;
        const newRect = transformRotateRect(rect, rotation, panel);
        const startX = newRect.x + chartDimensions.left + panel.left;
        const endX = startX + newRect.width;
        const startY = newRect.y + chartDimensions.top + panel.top;
        const endY = startY + newRect.height;
        const bounds = { startX, endX, startY, endY };
        const isWithinBounds = (0, dimensions_1.isWithinRectBounds)(cursorPosition, bounds);
        if (isWithinBounds) {
            return {
                id,
                specId,
                isVisible: true,
                annotationType: specs_1.AnnotationType.Rectangle,
                anchor: {
                    x: cursorPosition.x,
                    y: cursorPosition.y,
                    width: 0,
                    height: 0,
                },
                datum,
            };
        }
    }
    return null;
}
exports.getRectAnnotationTooltipState = getRectAnnotationTooltipState;
function transformRotateRect(rect, rotation, dim) {
    const isHorizontalRotated = (0, common_1.isHorizontalRotation)(rotation);
    const width = isHorizontalRotated ? dim.width : dim.height;
    const height = isHorizontalRotated ? dim.height : dim.width;
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