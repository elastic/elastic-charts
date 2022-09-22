"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderChartTitle = void 0;
function renderChartTitle(ctx, config, chartWidth, cartesianTop, aggregationFunctionName) {
    ctx.save();
    var titleFontSize = 32;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = "normal normal 200 ".concat(titleFontSize, "px Inter, Helvetica, Arial, sans-serif");
    ctx.fillStyle = config.subduedFontColor;
    ctx.fillText(config.queryConfig.metricFieldName, chartWidth / 2, cartesianTop / 2 - titleFontSize * 0.5);
    ctx.fillText(aggregationFunctionName, chartWidth / 2, cartesianTop / 2 + titleFontSize * 0.5);
    ctx.restore();
}
exports.renderChartTitle = renderChartTitle;
//# sourceMappingURL=chart_title.js.map