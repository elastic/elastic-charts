"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderRect = void 0;
var color_library_wrappers_1 = require("../../../../../common/color_library_wrappers");
var line_1 = require("./line");
function renderRect(ctx, _a, _b, stroke, disableBorderOffset) {
    var _c, _d;
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    var color = _b.color, texture = _b.texture;
    if (disableBorderOffset === void 0) { disableBorderOffset = false; }
    var borderOffset = !disableBorderOffset && stroke.width >= line_1.MIN_STROKE_WIDTH ? stroke.width : 0;
    if (stroke.width >= line_1.MIN_STROKE_WIDTH && height >= borderOffset && width >= borderOffset) {
        ctx.strokeStyle = (0, color_library_wrappers_1.RGBATupleToString)(stroke.color);
        ctx.lineWidth = stroke.width;
        ctx.beginPath();
        ctx.rect(x + borderOffset / 2, y + borderOffset / 2, width - borderOffset, height - borderOffset);
        ctx.setLineDash((_c = stroke.dash) !== null && _c !== void 0 ? _c : []);
        ctx.lineCap = ((_d = stroke.dash) === null || _d === void 0 ? void 0 : _d.length) ? 'butt' : 'square';
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