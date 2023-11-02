"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorBandStyle = exports.getGeometryStateStyle = void 0;
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
function getGeometryStateStyle(cell, sharedGeometryStyle, highlightedLegendBands) {
    const { default: defaultStyles, highlighted, unhighlighted } = sharedGeometryStyle;
    if (highlightedLegendBands.length > 0) {
        const isHighlightedBand = (0, viewmodel_1.isValueInRanges)(cell.value, highlightedLegendBands);
        return isHighlightedBand ? highlighted : unhighlighted;
    }
    return defaultStyles;
}
exports.getGeometryStateStyle = getGeometryStateStyle;
function getColorBandStyle(cell, geometryStateStyle) {
    const fillColor = (0, color_library_wrappers_1.overrideOpacity)(cell.fill.color, (opacity) => opacity * geometryStateStyle.opacity);
    const fill = {
        ...cell.fill,
        color: fillColor,
    };
    const strokeColor = (0, color_library_wrappers_1.overrideOpacity)(cell.stroke.color, (opacity) => opacity * geometryStateStyle.opacity);
    const stroke = {
        ...cell.stroke,
        color: strokeColor,
    };
    return { fill, stroke };
}
exports.getColorBandStyle = getColorBandStyle;
//# sourceMappingURL=utils.js.map