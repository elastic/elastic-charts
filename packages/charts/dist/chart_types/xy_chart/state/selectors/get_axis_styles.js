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
exports.getAxesStylesSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_theme_1 = require("../../../../state/selectors/get_chart_theme");
var common_1 = require("../../../../utils/common");
var axis_type_utils_1 = require("../../utils/axis_type_utils");
var get_specs_1 = require("./get_specs");
exports.getAxesStylesSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getAxisSpecsSelector, get_chart_theme_1.getChartThemeSelector], function (axesSpecs, _a) {
    var sharedAxesStyle = _a.axes;
    return axesSpecs.reduce(function (axesStyles, _a) {
        var _b;
        var id = _a.id, style = _a.style, gridLine = _a.gridLine, position = _a.position;
        var gridStyle = gridLine && { gridLine: (_b = {}, _b[(0, axis_type_utils_1.isVerticalAxis)(position) ? 'vertical' : 'horizontal'] = gridLine, _b) };
        return axesStyles.set(id, style ? (0, common_1.mergePartial)(sharedAxesStyle, __assign(__assign({}, style), gridStyle)) : null);
    }, new Map());
});
//# sourceMappingURL=get_axis_styles.js.map