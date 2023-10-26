"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shapeViewModel = void 0;
const common_1 = require("./../../../../utils/common");
const scales_1 = require("../../../../scales");
const constants_1 = require("../../specs/constants");
function shapeViewModel(spec, theme, chartDimensions) {
    const { width, height } = chartDimensions;
    const { chartMargins: margin } = theme;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const chartCenter = {
        x: margin.left + innerWidth / 2,
        y: margin.top + innerHeight / 2,
    };
    const { subtype, ticks, bands, domain, bandFillColor, tickValueFormatter, labelMajor, labelMinor, centralMajor, centralMinor, bandLabels, angleStart, angleEnd, } = spec;
    const lowestValue = (0, common_1.isFiniteNumber)(domain.min) ? domain.min : 0;
    const highestValue = (0, common_1.isFiniteNumber)(domain.max) ? domain.max : 1;
    const base = (0, common_1.clamp)(spec.base, lowestValue, highestValue);
    const target = !(0, common_1.isNil)(spec.target) && spec.target <= highestValue && spec.target >= lowestValue ? spec.target : undefined;
    const actual = (0, common_1.clamp)(spec.actual, lowestValue, highestValue);
    const finalTicks = Array.isArray(ticks)
        ? ticks.filter((0, common_1.isBetween)(lowestValue, highestValue))
        : new scales_1.ScaleContinuous({
            type: 'linear',
            domain: [lowestValue, highestValue],
            range: [0, 1],
        }, {
            desiredTickCount: ticks !== null && ticks !== void 0 ? ticks : getDesiredTicks(subtype, angleStart, angleEnd),
        }).ticks();
    const finalBands = Array.isArray(bands)
        ? bands.reduce(...(0, common_1.clampAll)(lowestValue, highestValue))
        : new scales_1.ScaleContinuous({
            type: 'linear',
            domain: [lowestValue, highestValue],
            range: [0, 1],
        }, {
            desiredTickCount: bands !== null && bands !== void 0 ? bands : getDesiredTicks(subtype, angleStart, angleEnd),
        }).ticks();
    const aboveBaseCount = finalBands.filter((b) => b > base).length;
    const belowBaseCount = finalBands.filter((b) => b <= base).length;
    const callbackArgs = {
        base,
        target,
        actual,
        highestValue,
        lowestValue,
        aboveBaseCount,
        belowBaseCount,
    };
    const bulletViewModel = {
        subtype,
        base,
        target,
        actual,
        bands: finalBands.map((value, index) => ({
            value,
            fillColor: bandFillColor({ value, index, ...callbackArgs }),
            text: bandLabels,
        })),
        ticks: finalTicks.map((value, index) => ({
            value,
            text: tickValueFormatter({ value, index, ...callbackArgs }),
        })),
        labelMajor: typeof labelMajor === 'string' ? labelMajor : labelMajor({ value: NaN, index: 0, ...callbackArgs }),
        labelMinor: typeof labelMinor === 'string' ? labelMinor : labelMinor({ value: NaN, index: 0, ...callbackArgs }),
        centralMajor: typeof centralMajor === 'string' ? centralMajor : centralMajor({ value: NaN, index: 0, ...callbackArgs }),
        centralMinor: typeof centralMinor === 'string' ? centralMinor : centralMinor({ value: NaN, index: 0, ...callbackArgs }),
        highestValue,
        lowestValue,
        aboveBaseCount,
        belowBaseCount,
        angleStart,
        angleEnd,
        tooltipValueFormatter: () => '',
    };
    const pickQuads = (x, y) => -innerWidth / 2 <= x && x <= innerWidth / 2 && -innerHeight / 2 <= y && y <= innerHeight / 2
        ? [bulletViewModel]
        : [];
    return {
        theme: theme.goal,
        chartCenter,
        bulletViewModel,
        pickQuads,
    };
}
exports.shapeViewModel = shapeViewModel;
function getDesiredTicks(subtype, angleStart, angleEnd) {
    if (subtype !== constants_1.GoalSubtype.Goal)
        return 5;
    const arc = Math.abs(angleStart - angleEnd);
    return Math.ceil(arc / (Math.PI / 4));
}
//# sourceMappingURL=viewmodel.js.map