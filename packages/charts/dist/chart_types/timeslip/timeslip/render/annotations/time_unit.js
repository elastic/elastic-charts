"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTimeUnitAnnotation = void 0;
var translations_1 = require("../../translations");
function renderTimeUnitAnnotation(ctx, config, binUnitCount, binUnit, chartTopFontSize, unitBarMaxWidthPixels) {
    ctx.save();
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.font = config.monospacedFontShorthand;
    ctx.fillStyle = config.a11y.contrast === 'low' ? config.subduedFontColor : config.defaultFontColor;
    ctx.fillText("1 ".concat(translations_1.uiStrings[config.locale].bar, " = ").concat(binUnitCount, " ").concat(translations_1.uiStrings[config.locale][binUnit + (binUnitCount !== 1 ? 's' : '')]), 0, -chartTopFontSize * 0.5);
    var unitBarY = -chartTopFontSize * 2.2;
    ctx.fillRect(0, unitBarY, unitBarMaxWidthPixels, 1);
    ctx.fillRect(0, unitBarY - 3, 1, 7);
    ctx.fillRect(unitBarMaxWidthPixels - 1, unitBarY - 3, 1, 7);
    ctx.restore();
}
exports.renderTimeUnitAnnotation = renderTimeUnitAnnotation;
//# sourceMappingURL=time_unit.js.map