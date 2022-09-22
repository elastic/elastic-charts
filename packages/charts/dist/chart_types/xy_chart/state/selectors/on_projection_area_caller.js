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
exports.createOnProjectionAreaCaller = void 0;
var __1 = require("../../..");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
function isDiff(prevProps, nextProps) {
    return (prevProps.top !== nextProps.top ||
        prevProps.left !== nextProps.left ||
        prevProps.width !== nextProps.width ||
        prevProps.height !== nextProps.height);
}
var getParentDimension = function (state) { return state.parentDimensions; };
function createOnProjectionAreaCaller() {
    var prevProps = null;
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.XYAxis) {
            selector = (0, create_selector_1.createCustomCachedSelector)([compute_chart_dimensions_1.computeChartDimensionsSelector, get_settings_spec_1.getSettingsSpecSelector, getParentDimension], function (_a, _b, parent) {
                var chartDimensions = _a.chartDimensions;
                var onProjectionAreaChange = _b.onProjectionAreaChange;
                var nextProps = { projection: __assign({}, chartDimensions), parent: __assign({}, parent) };
                var areDifferent = !prevProps ||
                    isDiff(prevProps.projection, nextProps.projection) ||
                    isDiff(nextProps.parent, nextProps.parent);
                if (onProjectionAreaChange && areDifferent) {
                    onProjectionAreaChange(nextProps);
                }
                prevProps = nextProps;
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnProjectionAreaCaller = createOnProjectionAreaCaller;
//# sourceMappingURL=on_projection_area_caller.js.map