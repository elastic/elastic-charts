"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTimeExtentAnnotation = void 0;
function renderTimeExtentAnnotation(ctx, config, localeOptions, timeDomainFrom, timeDomainTo, cartesianWidth, chartTopFontSize) {
    ctx.save();
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    ctx.font = config.monospacedFontShorthand;
    ctx.fillStyle = config.subduedFontColor;
    ctx.fillText("".concat(new Date(timeDomainFrom * 1000).toLocaleString(config.locale, localeOptions), " \u2014 ").concat(new Date(timeDomainTo * 1000).toLocaleString(config.locale, localeOptions)), cartesianWidth, -chartTopFontSize * 0.5);
    ctx.restore();
}
exports.renderTimeExtentAnnotation = renderTimeExtentAnnotation;
//# sourceMappingURL=time_extent.js.map