"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.divergingPercentage = exports.divergingWiggle = exports.divergingSilhouette = exports.diverging = void 0;
function getWiggleOffsets(series, order) {
    var _a, _b, _c, _d, _e, _f, _g;
    const offsets = [];
    let y, j;
    for (y = 0, j = 1; j < ((_c = (_b = series[(_a = order[0]) !== null && _a !== void 0 ? _a : 0]) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0); ++j) {
        let i, s1, s2;
        for (i = 0, s1 = 0, s2 = 0; i < series.length; ++i) {
            const si = series[order[i]];
            const sij0 = ((_d = si[j]) === null || _d === void 0 ? void 0 : _d[1]) || 0;
            const sij1 = ((_e = si[j - 1]) === null || _e === void 0 ? void 0 : _e[1]) || 0;
            let s3 = (sij0 - sij1) / 2;
            for (let k = 0; k < i; ++k) {
                const sk = series[order[k]];
                const skj0 = ((_f = sk[j]) === null || _f === void 0 ? void 0 : _f[1]) || 0;
                const skj1 = ((_g = sk[j - 1]) === null || _g === void 0 ? void 0 : _g[1]) || 0;
                s3 += skj0 - skj1;
            }
            s1 += sij0;
            s2 += s3 * sij0;
        }
        offsets.push(y);
        if (s1)
            y -= s2 / s1;
    }
    offsets.push(y);
    return offsets;
}
const divergingOffset = (isSilhouette = false) => {
    return function (series, order) {
        var _a, _b;
        const n = series.length;
        if (!(n > 0))
            return;
        for (let i, j = 0, sumYn, sumYp, yp, yn = 0, s0 = series[(_a = order[0]) !== null && _a !== void 0 ? _a : 0], m = (_b = s0 === null || s0 === void 0 ? void 0 : s0.length) !== null && _b !== void 0 ? _b : 0; j < m; ++j) {
            for (yn = 0, sumYn = 0, sumYp = 0, i = 0; i < n; ++i) {
                const d = series[order[i]][j];
                const dy = d[1] - d[0];
                if (dy < 0) {
                    sumYn += Math.abs(d[1]) || 0;
                    yn += dy;
                }
                else {
                    sumYp += d[1] || 0;
                }
            }
            const silhouetteOffset = sumYp / 2 - sumYn / 2;
            const offset = isSilhouette ? -silhouetteOffset : 0;
            yn += offset;
            for (yp = offset, i = 0; i < n; ++i) {
                const d = series[order[i]][j];
                const dy = d[1] - d[0];
                if (dy >= 0) {
                    d[0] = yp;
                    d[1] = yp += dy;
                }
                else {
                    d[1] = yn;
                    d[0] = yn -= dy;
                }
            }
        }
    };
};
exports.diverging = divergingOffset();
exports.divergingSilhouette = divergingOffset(true);
function divergingWiggle(series, order) {
    var _a, _b, _c;
    const n = series.length;
    const s0 = series[(_a = order[0]) !== null && _a !== void 0 ? _a : 0];
    const m = (_b = s0 === null || s0 === void 0 ? void 0 : s0.length) !== null && _b !== void 0 ? _b : 0;
    if (!(n > 0) || !(m > 0))
        return (0, exports.diverging)(series, order);
    const offsets = getWiggleOffsets(series, order);
    for (let i, j = 0, sumYn, yp, yn = 0; j < m; ++j) {
        for (i = 0, yn = 0, sumYn = 0; i < n; ++i) {
            const d = series[order[i]][j];
            if (d[1] - d[0] < 0) {
                sumYn += Math.abs(d[1]) || 0;
            }
        }
        const offset = (_c = offsets[j]) !== null && _c !== void 0 ? _c : 0;
        yn += offset;
        for (yp = offset + sumYn, yn = offset, i = 0; i < n; ++i) {
            const d = series[order[i]][j];
            const dy = d[1] - d[0];
            if (dy >= 0) {
                d[0] = yp;
                d[1] = yp += dy;
            }
            else {
                d[1] = yn;
                d[0] = yn -= dy;
            }
        }
    }
}
exports.divergingWiggle = divergingWiggle;
function divergingPercentage(series, order) {
    var _a, _b;
    const n = series.length;
    if (!(n > 0))
        return;
    for (let i, j = 0, sumYn, sumYp; j < ((_b = (_a = series[0]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0); ++j) {
        for (sumYn = sumYp = i = 0; i < n; ++i) {
            const d = series[order[i]][j];
            if (d[1] - d[0] < 0) {
                sumYn += Math.abs(d[1]) || 0;
            }
            else {
                sumYp += d[1] || 0;
            }
        }
        const sumY = sumYn + sumYp;
        if (sumY === 0)
            continue;
        let yp = sumYn / sumY;
        let yn = 0;
        for (i = 0; i < n; ++i) {
            const d = series[order[i]][j];
            const dy = d[1] - d[0];
            const participation = Math.abs(dy / sumY);
            if (dy >= 0) {
                d[0] = yp;
                d[1] = yp += participation;
            }
            else {
                d[0] = yn;
                d[1] = yn += participation;
            }
        }
    }
}
exports.divergingPercentage = divergingPercentage;
//# sourceMappingURL=diverging_offsets.js.map