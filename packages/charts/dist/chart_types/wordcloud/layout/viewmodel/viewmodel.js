"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shapeViewModel = void 0;
function shapeViewModel(spec, theme, chartDimensions) {
    const { width, height } = chartDimensions;
    const { chartMargins: margin } = theme;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const chartCenter = {
        x: width * margin.left + innerWidth / 2,
        y: height * margin.top + innerHeight / 2,
    };
    const { id, startAngle, endAngle, angleCount, padding, fontWeight, fontFamily, fontStyle, minFontSize, maxFontSize, spiral, exponent, data, weightFn, outOfRoomCallback, } = spec;
    const wordcloudViewModel = {
        startAngle,
        endAngle,
        angleCount,
        padding,
        fontWeight,
        fontFamily,
        fontStyle,
        minFontSize,
        maxFontSize,
        spiral,
        exponent,
        data,
        weightFn,
        outOfRoomCallback,
    };
    const pickQuads = (x, y) => -innerWidth / 2 <= x && x <= innerWidth / 2 && -innerHeight / 2 <= y && y <= innerHeight / 2
        ? [wordcloudViewModel]
        : [];
    return {
        chartCenter,
        wordcloudViewModel,
        pickQuads,
        specId: id,
    };
}
exports.shapeViewModel = shapeViewModel;
//# sourceMappingURL=viewmodel.js.map