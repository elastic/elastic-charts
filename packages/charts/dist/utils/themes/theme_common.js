"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_GEOMETRY_STYLES = exports.LEGACY_CHART_MARGINS = exports.DEFAULT_CHART_MARGINS = exports.DEFAULT_CHART_PADDING = exports.DEFAULT_MISSING_COLOR = void 0;
const colors_1 = require("../../common/colors");
exports.DEFAULT_MISSING_COLOR = colors_1.Colors.Red.keyword;
exports.DEFAULT_CHART_PADDING = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};
exports.DEFAULT_CHART_MARGINS = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
};
exports.LEGACY_CHART_MARGINS = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
};
exports.DEFAULT_GEOMETRY_STYLES = {
    default: {
        opacity: 1,
    },
    highlighted: {
        opacity: 1,
    },
    unhighlighted: {
        opacity: 0.25,
    },
};
//# sourceMappingURL=theme_common.js.map