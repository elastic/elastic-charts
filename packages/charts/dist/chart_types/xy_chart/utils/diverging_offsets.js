"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.divergingPercentage = exports.divergingWiggle = exports.divergingSilhouette = exports.diverging = void 0;
function getWiggleOffsets(series, order) {
    var offsets = [];
    var y, j;
    for (y = 0, j = 1; j < series[order[0]].length; ++j) {
        var i = void 0, s1 = void 0, s2 = void 0;
        for (i = 0, s1 = 0, s2 = 0; i < series.length; ++i) {
            var si = series[order[i]];
            var sij0 = si[j][1] || 0;
            var sij1 = si[j - 1][1] || 0;
            var s3 = (sij0 - sij1) / 2;
            for (var k = 0; k < i; ++k) {
                var sk = series[order[k]];
                var skj0 = sk[j][1] || 0;
                var skj1 = sk[j - 1][1] || 0;
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
var divergingOffset = function (isSilhouette) {
    if (isSilhouette === void 0) { isSilhouette = false; }
    return function (series, order) {
        var n = series.length;
        if (!(n > 0))
            return;
        for (var i = void 0, j = 0, sumYn = void 0, sumYp = void 0, yp = void 0, yn = 0, s0 = series[order[0]], m = s0.length; j < m; ++j) {
            for (yn = 0, sumYn = 0, sumYp = 0, i = 0; i < n; ++i) {
                var d = series[order[i]][j];
                var dy = d[1] - d[0];
                if (dy < 0) {
                    sumYn += Math.abs(d[1]) || 0;
                    yn += dy;
                }
                else {
                    sumYp += d[1] || 0;
                }
            }
            var silhouetteOffset = sumYp / 2 - sumYn / 2;
            var offset = isSilhouette ? -silhouetteOffset : 0;
            yn += offset;
            for (yp = offset, i = 0; i < n; ++i) {
                var d = series[order[i]][j];
                var dy = d[1] - d[0];
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
    var n = series.length;
    var s0 = series[order[0]];
    var m = s0.length;
    if (!(n > 0) || !(m > 0))
        return (0, exports.diverging)(series, order);
    var offsets = getWiggleOffsets(series, order);
    for (var i = void 0, j = 0, sumYn = void 0, yp = void 0, yn = 0; j < m; ++j) {
        for (i = 0, yn = 0, sumYn = 0; i < n; ++i) {
            var d = series[order[i]][j];
            if (d[1] - d[0] < 0) {
                sumYn += Math.abs(d[1]) || 0;
            }
        }
        var offset = offsets[j];
        yn += offset;
        for (yp = offset + sumYn, yn = offset, i = 0; i < n; ++i) {
            var d = series[order[i]][j];
            var dy = d[1] - d[0];
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
    var n = series.length;
    if (!(n > 0))
        return;
    for (var i = void 0, j = 0, sumYn = void 0, sumYp = void 0; j < series[0].length; ++j) {
        for (sumYn = sumYp = i = 0; i < n; ++i) {
            var d = series[order[i]][j];
            if (d[1] - d[0] < 0) {
                sumYn += Math.abs(d[1]) || 0;
            }
            else {
                sumYp += d[1] || 0;
            }
        }
        var sumY = sumYn + sumYp;
        if (sumY === 0)
            continue;
        var yp = sumYn / sumY;
        var yn = 0;
        for (i = 0; i < n; ++i) {
            var d = series[order[i]][j];
            var dy = d[1] - d[0];
            var participation = Math.abs(dy / sumY);
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