"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTimeUnitAnnotation = void 0;
const LOCALE_TRANSLATIONS = {
    bar: 'bar',
    year: ['year', 'years'],
    month: ['month', 'months'],
    week: ['week', 'weeks'],
    day: ['day', 'days'],
    hour: ['hour', 'hours'],
    minute: ['minute', 'minutes'],
    second: ['second', 'seconds'],
    millisecond: ['millisecond', 'milliseconds'],
    one: ['', ''],
};
function renderTimeUnitAnnotation(ctx, config, binUnitCount, binUnit, chartTopFontSize, yOffset, unitBarMaxWidthPixels) {
    const unitBarY = yOffset - chartTopFontSize * 1.7;
    ctx.save();
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left';
    ctx.font = config.monospacedFontShorthand;
    ctx.fillStyle = config.a11y.contrast === 'low' ? config.subduedFontColor : config.defaultFontColor;
    ctx.fillText(`1 ${LOCALE_TRANSLATIONS.bar} = ${binUnitCount} ${LOCALE_TRANSLATIONS[binUnit][binUnitCount === 1 ? 0 : 1]}`, 0, yOffset);
    ctx.fillRect(0, unitBarY, unitBarMaxWidthPixels, 1);
    ctx.fillRect(0, unitBarY - 3, 1, 7);
    ctx.fillRect(unitBarMaxWidthPixels - 1, unitBarY - 3, 1, 7);
    ctx.restore();
}
exports.renderTimeUnitAnnotation = renderTimeUnitAnnotation;
//# sourceMappingURL=time_unit.js.map