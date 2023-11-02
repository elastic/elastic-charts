"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNiceLinearTicks = exports.getLinearTicks = void 0;
const common_1 = require("../../../utils/common");
const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);
function getLinearTicks(start, stop, count, base = 2) {
    let reverse, i = -1, n, ticks, step;
    stop = +stop;
    start = +start;
    count = +count;
    if (start === stop && count > 0)
        return [start];
    if ((reverse = stop < start)) {
        n = start;
        start = stop;
        stop = n;
    }
    if ((step = tickIncrement(start, stop, count, base)) === 0 || !isFinite(step))
        return [];
    if (step > 0) {
        let r0 = Math.round(start / step), r1 = Math.round(stop / step);
        if (r0 * step < start)
            ++r0;
        if (r1 * step > stop)
            --r1;
        ticks = new Array((n = r1 - r0 + 1));
        while (++i < n)
            ticks[i] = (r0 + i) * step;
    }
    else {
        step = -step;
        let r0 = Math.round(start * step), r1 = Math.round(stop * step);
        if (r0 / step < start)
            ++r0;
        if (r1 / step > stop)
            --r1;
        ticks = new Array((n = r1 - r0 + 1));
        while (++i < n)
            ticks[i] = (r0 + i) / step;
    }
    if (reverse)
        ticks.reverse();
    return ticks;
}
exports.getLinearTicks = getLinearTicks;
function tickIncrement(start, stop, count, base = 10) {
    const step = (stop - start) / Math.max(0, count);
    const power = Math.floor(Math.log(step) / Math.log(base) + Number.EPSILON);
    const error = step / Math.pow(base, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(base, power)
        : -Math.pow(base, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}
function getNiceLinearTicks(scale, count = 10, base = 10) {
    const d = scale.domain();
    let i0 = 0;
    let i1 = d.length - 1;
    let start = d[i0];
    let stop = d[i1];
    let prestep;
    let step;
    let maxIter = 10;
    if ((0, common_1.isNil)(stop) || (0, common_1.isNil)(start)) {
        return scale;
    }
    if (stop < start) {
        step = start;
        start = stop;
        stop = step;
        step = i0;
        i0 = i1;
        i1 = step;
    }
    while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count, base);
        if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return scale.domain(d);
        }
        else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
        }
        else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
        }
        else {
            break;
        }
        prestep = step;
    }
    return scale;
}
exports.getNiceLinearTicks = getNiceLinearTicks;
//# sourceMappingURL=get_linear_ticks.js.map