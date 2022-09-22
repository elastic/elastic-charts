"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOverCaller = void 0;
var __1 = require("../../..");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var get_tooltip_values_highlighted_geoms_1 = require("./get_tooltip_values_highlighted_geoms");
function isOverElement(prevProps, nextProps) {
    var _a;
    if (!nextProps || !nextProps.settings || !nextProps.settings.onElementOver) {
        return false;
    }
    var nextGeomValues = nextProps.highlightedGeometries;
    var prevGeomValues = (_a = prevProps === null || prevProps === void 0 ? void 0 : prevProps.highlightedGeometries) !== null && _a !== void 0 ? _a : [];
    return (nextGeomValues.length > 0 &&
        (nextGeomValues.length !== prevGeomValues.length ||
            !nextGeomValues.every(function (_a, index) {
                var next = _a.value;
                var prev = prevGeomValues[index].value;
                return prev && prev.x === next.x && prev.y === next.y && prev.accessor === next.accessor;
            })));
}
function createOnElementOverCaller() {
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
                if (isOverElement(prevProps, nextProps) && settings.onElementOver) {
                    var elements = highlightedGeometries.map(function (_a) {
                        var value = _a.value, seriesIdentifier = _a.seriesIdentifier;
                        return [value, seriesIdentifier];
                    });
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