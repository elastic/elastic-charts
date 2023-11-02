"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRect = void 0;
const line_1 = require("./line");
const color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
function renderRect(ctx, { x, y, width, height }, { color, texture }, stroke, disableBorderOffset = false) {
    var _a, _b;
    const borderOffset = !disableBorderOffset && stroke.width >= line_1.MIN_STROKE_WIDTH ? stroke.width : 0;
    if (stroke.width >= line_1.MIN_STROKE_WIDTH && height >= borderOffset && width >= borderOffset) {
        ctx.strokeStyle = (0, color_library_wrappers_1.RGBATupleToString)(stroke.color);
        ctx.lineWidth = stroke.width;
        ctx.beginPath();
        ctx.rect(x + borderOffset / 2, y + borderOffset / 2, width - borderOffset, height - borderOffset);
        ctx.setLineDash((_a = stroke.dash) !== null && _a !== void 0 ? _a : []);
        ctx.lineCap = ((_b = stroke.dash) === null || _b === void 0 ? void 0 : _b.length) ? 'butt' : 'square';
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.rect(x + borderOffset, y + borderOffset, width - borderOffset * 2, height - borderOffset * 2);
    ctx.fillStyle = (0, color_library_wrappers_1.RGBATupleToString)(color);
    ctx.fill();
    if (texture) {
        ctx.fillStyle = texture.pattern;
        ctx.fill();
    }
}
exports.renderRect = renderRect;
//# sourceMappingURL=rect.js.map