"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenspaceMarkerScaleCompressor = void 0;
var screenspaceMarkerScaleCompressor = function (domainPositions, itemWidths, outerWidth) {
    var result = { bounds: [], scaleMultiplier: Infinity };
    var itemCount = Math.min(domainPositions.length, itemWidths.length);
    for (var left = 0; left < itemCount; left++) {
        for (var right = 0; right < itemCount; right++) {
            if (domainPositions[left] > domainPositions[right])
                continue;
            var range = outerWidth - itemWidths[left][0] - itemWidths[right][1];
            var domain = domainPositions[right] - domainPositions[left];
            var scaleMultiplier = range / domain;
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