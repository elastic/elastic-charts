"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shapeViewModel = void 0;
function shapeViewModel(spec, theme, chartDimensions) {
    var width = chartDimensions.width, height = chartDimensions.height;
    var margin = theme.chartMargins;
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    var chartCenter = {
        x: width * margin.left + innerWidth / 2,
        y: height * margin.top + innerHeight / 2,
    };
    var id = spec.id, startAngle = spec.startAngle, endAngle = spec.endAngle, angleCount = spec.angleCount, padding = spec.padding, fontWeight = spec.fontWeight, fontFamily = spec.fontFamily, fontStyle = spec.fontStyle, minFontSize = spec.minFontSize, maxFontSize = spec.maxFontSize, spiral = spec.spiral, exponent = spec.exponent, data = spec.data, weightFn = spec.weightFn, outOfRoomCallback = spec.outOfRoomCallback;
    var wordcloudViewModel = {
        startAngle: startAngle,
        endAngle: endAngle,
        angleCount: angleCount,
        padding: padding,
        fontWeight: fontWeight,
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        minFontSize: minFontSize,
        maxFontSize: maxFontSize,
        spiral: spiral,
        exponent: exponent,
        data: data,
        weightFn: weightFn,
        outOfRoomCallback: outOfRoomCallback,
    };
    var pickQuads = function (x, y) {
        return -innerWidth / 2 <= x && x <= innerWidth / 2 && -innerHeight / 2 <= y && y <= innerHeight / 2
            ? [wordcloudViewModel]
            : [];
    };
    return {
        chartCenter: chartCenter,
        wordcloudViewModel: wordcloudViewModel,
        pickQuads: pickQuads,
        specId: id,
    };
}
exports.shapeViewModel = shapeViewModel;
//# sourceMappingURL=viewmodel.js.map