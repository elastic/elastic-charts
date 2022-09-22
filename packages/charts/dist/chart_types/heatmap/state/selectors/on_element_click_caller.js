"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementClickCaller = void 0;
var __1 = require("../../..");
var create_selector_1 = require("../../../../state/create_selector");
var get_last_click_1 = require("../../../../state/selectors/get_last_click");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var utils_1 = require("../../../../state/utils");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var heatmap_spec_1 = require("./heatmap_spec");
var picked_shapes_1 = require("./picked_shapes");
function createOnElementClickCaller() {
    var prevClick = null;
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            selector = (0, create_selector_1.createCustomCachedSelector)([heatmap_spec_1.getSpecOrNull, get_last_click_1.getLastClickSelector, get_settings_spec_1.getSettingsSpecSelector, picked_shapes_1.getPickedShapes], function (spec, lastClick, settings, pickedShapes) {
                if (!spec) {
                    return;
                }
                if (!settings.onElementClick) {
                    return;
                }
                if (!(0, viewmodel_types_1.isPickedCells)(pickedShapes)) {
                    return;
                }
                var nextPickedShapesLength = pickedShapes.length;
                if (nextPickedShapesLength > 0 && (0, utils_1.isClicking)(prevClick, lastClick) && settings && settings.onElementClick) {
                    var elements = pickedShapes.map(function (value) { return [
                        value,
                        {
                            specId: spec.id,
                            key: "spec{".concat(spec.id, "}"),
                        },
                    ]; });
                    settings.onElementClick(elements);
                }
                prevClick = lastClick;
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementClickCaller = createOnElementClickCaller;
//# sourceMappingURL=on_element_click_caller.js.map