"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOverCaller = void 0;
const get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
const __1 = require("../../..");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
function isOverElement(prevProps, nextProps) {
    var _a;
    if (!nextProps || !nextProps.settings || !nextProps.settings.onElementOver) {
        return false;
    }
    const { highlightedGeometries: nextGeomValues } = nextProps;
    const prevGeomValues = (_a = prevProps === null || prevProps === void 0 ? void 0 : prevProps.highlightedGeometries) !== null && _a !== void 0 ? _a : [];
    return (nextGeomValues.length > 0 &&
        (nextGeomValues.length !== prevGeomValues.length ||
            !nextGeomValues.every(({ value: next }, index) => {
                var _a;
                const prev = (_a = prevGeomValues[index]) === null || _a === void 0 ? void 0 : _a.value;
                return prev && prev.x === next.x && prev.y === next.y && prev.accessor === next.accessor;
            })));
}
function createOnElementOverCaller() {
    let prevProps = null;
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.XYAxis) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_values_highlighted_geoms_1.getHighlightedTooltipTooltipValuesSelector, get_settings_spec_1.getSettingsSpecSelector], ({ highlightedGeometries }, settings) => {
                const nextProps = {
                    settings,
                    highlightedGeometries,
                };
                if (isOverElement(prevProps, nextProps) && settings.onElementOver) {
                    const elements = highlightedGeometries.map(({ value, seriesIdentifier }) => [value, seriesIdentifier]);
                    settings.onElementOver(elements);
                }
                prevProps = nextProps;
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementOverCaller = createOnElementOverCaller;
//# sourceMappingURL=on_element_over_caller.js.map