"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNiceLinearTicks = exports.getLinearTicks = void 0;
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function getLinearTicks(start, stop, count, base) {
    if (base === void 0) { base = 2; }
    var reverse, i = -1, n, ticks, step;
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
        var r0 = Math.round(start / step), r1 = Math.round(stop / step);
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
        var r0 = Math.round(start * step), r1 = Math.round(stop * step);
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
function tickIncrement(start, stop, count, base) {
    if (base === void 0) { base = 10; }
    var step = (stop - start) / Math.max(0, count);
    var power = Math.floor(Math.log(step) / Math.log(base) + Number.EPSILON);
    var error = step / Math.pow(base, power);
    return power >= 0
        ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(base, power)
        : -Math.pow(base, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}
function getNiceLinearTicks(scale, count, base) {
    if (count === void 0) { count = 10; }
    if (base === void 0) { base = 10; }
    var d = scale.domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;
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