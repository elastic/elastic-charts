"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTimeExtentAnnotation = void 0;
function renderTimeExtentAnnotation(ctx, config, localeOptions, { domainFrom, domainTo }, cartesianWidth, yOffset) {
    ctx.save();
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    ctx.font = config.monospacedFontShorthand;
    ctx.fillStyle = config.subduedFontColor;
    ctx.fillText(`${new Date(domainFrom * 1000).toLocaleString(config.locale, localeOptions)} — ${new Date(domainTo * 1000).toLocaleString(config.locale, localeOptions)}`, cartesianWidth, yOffset);
    ctx.restore();
}
exports.renderTimeExtentAnnotation = renderTimeExtentAnnotation;
//# sourceMappingURL=time_extent.js.map