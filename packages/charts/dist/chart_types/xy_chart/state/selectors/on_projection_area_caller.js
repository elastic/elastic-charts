"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnProjectionAreaCaller = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const __1 = require("../../..");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
function isDiff(prevProps, nextProps) {
    return (prevProps.top !== nextProps.top ||
        prevProps.left !== nextProps.left ||
        prevProps.width !== nextProps.width ||
        prevProps.height !== nextProps.height);
}
const getParentDimension = (state) => state.parentDimensions;
function createOnProjectionAreaCaller() {
    let prevProps = null;
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.XYAxis) {
            selector = (0, create_selector_1.createCustomCachedSelector)([compute_chart_dimensions_1.computeChartDimensionsSelector, get_settings_spec_1.getSettingsSpecSelector, getParentDimension], ({ chartDimensions }, { onProjectionAreaChange }, parent) => {
                const nextProps = { projection: { ...chartDimensions }, parent: { ...parent } };
                const areDifferent = !prevProps ||
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