"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendStyle = exports.getLegendListStyle = void 0;
const common_1 = require("../../utils/common");
function getLegendListStyle({ direction, floating, floatingColumns }, chartMargins, legendStyle, totalItems) {
    const { top: paddingTop, bottom: paddingBottom, left: paddingLeft, right: paddingRight } = chartMargins;
    if (direction === common_1.LayoutDirection.Horizontal) {
        return {
            paddingLeft,
            paddingRight,
            gridTemplateColumns: totalItems === 1 ? '1fr' : `repeat(auto-fill, minmax(${legendStyle.verticalWidth}px, 1fr))`,
        };
    }
    return {
        paddingTop,
        paddingBottom,
        ...(floating && {
            gridTemplateColumns: `repeat(${(0, common_1.clamp)(floatingColumns !== null && floatingColumns !== void 0 ? floatingColumns : 1, 1, totalItems)}, auto)`,
        }),
    };
}
exports.getLegendListStyle = getLegendListStyle;
function getLegendStyle({ direction, floating }, size, margin) {
    if (direction === common_1.LayoutDirection.Vertical) {
        const width = `${size.width}px`;
        return {
            width: floating ? undefined : width,
            maxWidth: floating ? undefined : width,
            marginLeft: margin,
            marginRight: margin,
        };
    }
    const height = `${size.height}px`;
    return {
        height,
        maxHeight: height,
        marginTop: margin,
        marginBottom: margin,
    };
}
exports.getLegendStyle = getLegendStyle;
//# sourceMappingURL=style_utils.js.map