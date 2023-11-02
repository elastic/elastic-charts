"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOutCaller = void 0;
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const __1 = require("../../..");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const isOutElement = (prevProps, nextProps) => {
    var _a;
    return Boolean(prevProps &&
        ((_a = nextProps === null || nextProps === void 0 ? void 0 : nextProps.settings) === null || _a === void 0 ? void 0 : _a.onElementOut) &&
        prevProps.highlightedGeometries.length > 0 &&
        nextProps.highlightedGeometries.length === 0);
};
function createOnElementOutCaller() {
    let prevProps = null;
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.XYAxis) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_values_highlighted_geoms_1.getHighlightedTooltipTooltipValuesSelector, get_settings_spec_1.getSettingsSpecSelector], ({ highlightedGeometries }, settings) => {
                const nextProps = {
                    settings,
                    highlightedGeometries,
                };
                if (isOutElement(prevProps, nextProps) && settings.onElementOut) {
                    settings.onElementOut();
                }
                prevProps = nextProps;
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementOutCaller = createOnElementOutCaller;
//# sourceMappingURL=on_element_out_caller.js.map