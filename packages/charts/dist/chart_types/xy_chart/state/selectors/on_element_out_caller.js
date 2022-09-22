"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOutCaller = void 0;
var __1 = require("../../..");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
var isOutElement = function (prevProps, nextProps) {
    var _a;
    return Boolean(prevProps &&
        ((_a = nextProps === null || nextProps === void 0 ? void 0 : nextProps.settings) === null || _a === void 0 ? void 0 : _a.onElementOut) &&
        prevProps.highlightedGeometries.length > 0 &&
        nextProps.highlightedGeometries.length === 0);
};
function createOnElementOutCaller() {
    var prevProps = null;
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.XYAxis) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_values_highlighted_geoms_1.getTooltipInfoAndGeometriesSelector, get_settings_spec_1.getSettingsSpecSelector], function (_a, settings) {
                var highlightedGeometries = _a.highlightedGeometries;
                var nextProps = {
                    settings: settings,
                    highlightedGeometries: highlightedGeometries,
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