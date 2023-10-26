"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLinearPartitionCanvas2d = void 0;
const colors_1 = require("../../../../common/colors");
const linear = (x) => x;
const easeInOut = (alpha) => (x) => x ** alpha / (x ** alpha + (1 - x) ** alpha);
const MAX_PADDING_RATIO = 0.25;
function renderLinearPartitionCanvas2d(ctx, dpr, { style: { sectorLineWidth: padding }, quadViewModel, diskCenter, width: panelWidth, height: panelHeight, layers, chartDimensions: { width: containerWidth, height: containerHeight }, animation, }, { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1 }, animationState) {
    if (animation === null || animation === void 0 ? void 0 : animation.duration) {
        window.cancelAnimationFrame(animationState.rafId);
        render(0);
        const focusChanged = currentFocusX0 !== prevFocusX0 || currentFocusX1 !== prevFocusX1;
        if (focusChanged) {
            animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
                const anim = (t) => {
                    const unitNormalizedTime = Math.max(0, Math.min(1, (t - epochStartTime) / animation.duration));
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
    function render(logicalTime, timeFunction = (animation === null || animation === void 0 ? void 0 : animation.duration)
        ? easeInOut(Math.min(5, animation.duration / 100))
        : linear) {
        const width = containerWidth * panelWidth;
        const height = containerHeight * panelHeight;
        const t = timeFunction(logicalTime);
        const focusX0 = t * currentFocusX0 + (1 - t) * prevFocusX0 || 0;
        const focusX1 = t * currentFocusX1 + (1 - t) * prevFocusX1 || 0;
        const scale = containerWidth / (focusX1 - focusX0);
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.scale(dpr, dpr);
        ctx.translate(diskCenter.x, diskCenter.y);
        ctx.clearRect(0, 0, width, height);
        quadViewModel.forEach(({ fillColor, x0, x1, y0px: y0, y1px: y1, dataName, textColor, depth }) => {
            var _a;
            if (y1 - y0 <= padding)
                return;
            const fx0 = Math.max((x0 - focusX0) * scale, 0);
            const fx1 = Math.min((x1 - focusX0) * scale, width);
            if (fx1 < 0 || fx0 > width)
                return;
            const layer = layers[depth - 1];
            const formatter = (_a = layer === null || layer === void 0 ? void 0 : layer.nodeLabel) !== null && _a !== void 0 ? _a : String;
            const label = formatter(dataName);
            const fWidth = fx1 - fx0;
            const fPadding = Math.min(padding, MAX_PADDING_RATIO * fWidth);
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