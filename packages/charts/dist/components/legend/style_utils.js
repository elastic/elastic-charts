"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendStyle = exports.getLegendListStyle = void 0;
var common_1 = require("../../utils/common");
function getLegendListStyle(_a, chartMargins, legendStyle, totalItems) {
    var direction = _a.direction, floating = _a.floating, floatingColumns = _a.floatingColumns;
    var paddingTop = chartMargins.top, paddingBottom = chartMargins.bottom, paddingLeft = chartMargins.left, paddingRight = chartMargins.right;
    if (direction === common_1.LayoutDirection.Horizontal) {
        return {
            paddingLeft: paddingLeft,
            paddingRight: paddingRight,
            gridTemplateColumns: totalItems === 1 ? '1fr' : "repeat(auto-fill, minmax(".concat(legendStyle.verticalWidth, "px, 1fr))"),
        };
    }
    return __assign({ paddingTop: paddingTop, paddingBottom: paddingBottom }, (floating && {
        gridTemplateColumns: "repeat(".concat((0, common_1.clamp)(floatingColumns !== null && floatingColumns !== void 0 ? floatingColumns : 1, 1, totalItems), ", auto)"),
    }));
}
exports.getLegendListStyle = getLegendListStyle;
function getLegendStyle(_a, size, margin) {
    var direction = _a.direction, floating = _a.floating;
    if (direction === common_1.LayoutDirection.Vertical) {
        var width = "".concat(size.width, "px");
        return {
            width: floating ? undefined : width,
            maxWidth: floating ? undefined : width,
            marginLeft: margin,
            marginRight: margin,
        };
    }
    var height = "".concat(size.height, "px");
    return {
        height: height,
        maxHeight: height,
        marginTop: margin,
        marginBottom: margin,
    };
}
exports.getLegendStyle = getLegendStyle;
//# sourceMappingURL=style_utils.js.map