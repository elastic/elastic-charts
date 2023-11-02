"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenspaceMarkerScaleCompressor = void 0;
const screenspaceMarkerScaleCompressor = (domainPositions, itemWidths, outerWidth) => {
    var _a, _b, _c, _d, _e, _f;
    const result = { bounds: [], scaleMultiplier: Infinity };
    const itemCount = Math.min(domainPositions.length, itemWidths.length);
    for (let left = 0; left < itemCount; left++) {
        for (let right = 0; right < itemCount; right++) {
            const domainLeft = (_a = domainPositions[left]) !== null && _a !== void 0 ? _a : NaN;
            const domainRight = (_b = domainPositions[right]) !== null && _b !== void 0 ? _b : NaN;
            if (domainLeft > domainRight)
                continue;
            const range = outerWidth - ((_d = (_c = itemWidths[left]) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : NaN) - ((_f = (_e = itemWidths[right]) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : NaN);
            const domain = domainRight - domainLeft;
            const scaleMultiplier = range / domain;
            if (scaleMultiplier < result.scaleMultiplier || Number.isNaN(scaleMultiplier)) {
                result.bounds[0] = left;
                result.bounds[1] = right;
                result.scaleMultiplier = scaleMultiplier;
            }
        }
    }
    return result;
};
exports.screenspaceMarkerScaleCompressor = screenspaceMarkerScaleCompressor;
//# sourceMappingURL=screenspace_marker_scale_compressor.js.map