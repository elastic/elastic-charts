"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasDragged = exports.isValidPointerOverEvent = void 0;
var specs_1 = require("../specs");
function isValidPointerOverEvent(mainScale, event) {
    return (0, specs_1.isPointerOverEvent)(event) && (event.unit === undefined || event.unit === mainScale.unit);
}
exports.isValidPointerOverEvent = isValidPointerOverEvent;
function hasDragged(prevProps, nextProps) {
    if (nextProps === null) {
        return false;
    }
    if (!nextProps.onBrushEnd) {
        return false;
    }
    var prevLastDrag = prevProps !== null ? prevProps.lastDrag : null;
    var nextLastDrag = nextProps.lastDrag;
    return nextLastDrag !== null && (prevLastDrag === null || prevLastDrag.end.time !== nextLastDrag.end.time);
}
exports.hasDragged = hasDragged;
//# sourceMappingURL=events.js.map