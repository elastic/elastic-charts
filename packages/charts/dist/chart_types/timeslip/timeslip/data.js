"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrichedData = exports.dataSource = void 0;
exports.dataSource = Symbol('dataSource');
var getEnrichedData = function (rows) {
    var stats = rows.reduce(function (p, _a) {
        var epochMs = _a.epochMs, value = _a.value;
        var minEpochMs = p.minEpochMs, maxEpochMs = p.maxEpochMs, minValue = p.minValue, maxValue = p.maxValue;
        p.minEpochMs = Math.min(minEpochMs, epochMs);
        p.maxEpochMs = Math.max(maxEpochMs, epochMs);
        p.minValue = Math.min(minValue, value);
        p.maxValue = Math.max(maxValue, value);
        return p;
    }, {
        minEpochMs: Infinity,
        maxEpochMs: -Infinity,
        minValue: Infinity,
        maxValue: -Infinity,
    });
    return { rows: rows, stats: stats };
};
exports.getEnrichedData = getEnrichedData;
//# sourceMappingURL=data.js.map