"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLinearPartitionCanvas2d = void 0;
var colors_1 = require("../../../../common/colors");
var linear = function (x) { return x; };
var easeInOut = function (alpha) { return function (x) { return Math.pow(x, alpha) / (Math.pow(x, alpha) + Math.pow((1 - x), alpha)); }; };
var MAX_PADDING_RATIO = 0.25;
function renderLinearPartitionCanvas2d(ctx, dpr, _a, _b, animationState) {
    var padding = _a.style.sectorLineWidth, quadViewModel = _a.quadViewModel, diskCenter = _a.diskCenter, panelWidth = _a.width, panelHeight = _a.height, layers = _a.layers, _c = _a.chartDimensions, containerWidth = _c.width, containerHeight = _c.height, animation = _a.animation;
    var currentFocusX0 = _b.currentFocusX0, currentFocusX1 = _b.currentFocusX1, prevFocusX0 = _b.prevFocusX0, prevFocusX1 = _b.prevFocusX1;
    if (animation === null || animation === void 0 ? void 0 : animation.duration) {
        window.cancelAnimationFrame(animationState.rafId);
        render(0);
        var focusChanged = currentFocusX0 !== prevFocusX0 || currentFocusX1 !== prevFocusX1;
        if (focusChanged) {
            animationState.rafId = window.requestAnimationFrame(function (epochStartTime) {
                var anim = function (t) {
                    var unitNormalizedTime = Math.max(0, Math.min(1, (t - epochStartTime) / animation.duration));
                    render(unitNormalizedTime);
                    if (unitNormalizedTime < 1) {
                        animationState.rafId = window.requestAnimationFrame(anim);
                    }
                };
                animationState.rafId = window.requestAnimationFrame(anim);
            });
        }
    }
    else {
        render(1);
    }
    function render(logicalTime, timeFunction) {
        if (timeFunction === void 0) { timeFunction = (animation === null || animation === void 0 ? void 0 : animation.duration)
            ? easeInOut(Math.min(5, animation.duration / 100))
            : linear; }
        var width = containerWidth * panelWidth;
        var height = containerHeight * panelHeight;
        var t = timeFunction(logicalTime);
        var focusX0 = t * currentFocusX0 + (1 - t) * prevFocusX0 || 0;
        var focusX1 = t * currentFocusX1 + (1 - t) * prevFocusX1 || 0;
        var scale = containerWidth / (focusX1 - focusX0);
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.scale(dpr, dpr);
        ctx.translate(diskCenter.x, diskCenter.y);
        ctx.clearRect(0, 0, width, height);
        quadViewModel.forEach(function (_a) {
            var _b;
            var fillColor = _a.fillColor, x0 = _a.x0, x1 = _a.x1, y0 = _a.y0px, y1 = _a.y1px, dataName = _a.dataName, textColor = _a.textColor, depth = _a.depth;
            if (y1 - y0 <= padding)
                return;
            var fx0 = Math.max((x0 - focusX0) * scale, 0);
            var fx1 = Math.min((x1 - focusX0) * scale, width);
            if (fx1 < 0 || fx0 > width)
                return;
            var layer = layers[depth - 1];
            var formatter = (_b = layer === null || layer === void 0 ? void 0 : layer.nodeLabel) !== null && _b !== void 0 ? _b : String;
            var label = formatter(dataName);
            var fWidth = fx1 - fx0;
            var fPadding = Math.min(padding, MAX_PADDING_RATIO * fWidth);
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.rect(fx0 + fPadding, y0 + padding / 2, fWidth - fPadding, y1 - y0 - padding);
            ctx.fill();
            if (textColor === colors_1.Colors.Transparent.keyword || label === '' || fWidth < 4)
                return;
            ctx.fillStyle = textColor;
            ctx.save();
            ctx.clip();
            ctx.fillText(label, fx0 + 3 * fPadding, (y0 + y1) / 2);
            ctx.restore();
        });
        ctx.restore();
    }
}
exports.renderLinearPartitionCanvas2d = renderLinearPartitionCanvas2d;
//# sourceMappingURL=canvas_linear_renderers.js.map