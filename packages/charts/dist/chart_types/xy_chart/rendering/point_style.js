"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPointGeometryStyles = void 0;
var color_library_wrappers_1 = require("../../../common/color_library_wrappers");
var common_1 = require("../../../utils/common");
var theme_1 = require("../../../utils/themes/theme");
function buildPointGeometryStyles(color, themePointStyle, overrides) {
    var _a;
    var pointStyle = (0, common_1.mergePartial)(themePointStyle, overrides);
    var opacityFn = function (opacity) { return opacity * pointStyle.opacity; };
    return {
        fill: { color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(color, pointStyle.fill)), opacityFn) },
        stroke: {
            color: (0, color_library_wrappers_1.overrideOpacity)((0, color_library_wrappers_1.colorToRgba)((0, common_1.getColorFromVariant)(color, pointStyle.stroke)), opacityFn),
            width: pointStyle.strokeWidth,
        },
        shape: (_a = pointStyle.shape) !== null && _a !== void 0 ? _a : theme_1.PointShape.Circle,
    };
}
exports.buildPointGeometryStyles = buildPointGeometryStyles;
//# sourceMappingURL=point_style.js.map