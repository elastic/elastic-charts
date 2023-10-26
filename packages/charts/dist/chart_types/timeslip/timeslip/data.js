"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrichedData = void 0;
const getEnrichedData = (rows) => {
    const stats = rows.reduce((p, { epochMs, value }) => {
        const { minEpochMs, maxEpochMs, minValue, maxValue } = p;
        p.minEpochMs = Math.min(minEpochMs, epochMs);
        p.maxEpochMs = Math.max(maxEpochMs, epochMs);
        p.minValue = Math.min(minValue, value !== null && value !== void 0 ? value : minValue);
        p.maxValue = Math.max(maxValue, value !== null && value !== void 0 ? value : maxValue);
        return p;
    }, {
        minEpochMs: Infinity,
        maxEpochMs: -Infinity,
        minValue: Infinity,
        maxValue: -Infinity,
    });
    return { rows, stats };
};
exports.getEnrichedData = getEnrichedData;
//# sourceMappingURL=data.js.map