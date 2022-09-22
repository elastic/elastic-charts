"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOutCaller = void 0;
var __1 = require("../../..");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var heatmap_spec_1 = require("./heatmap_spec");
var picked_shapes_1 = require("./picked_shapes");
function createOnElementOutCaller() {
    var prevPickedShapes = null;
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            selector = (0, create_selector_1.createCustomCachedSelector)([heatmap_spec_1.getSpecOrNull, picked_shapes_1.getPickedShapes, get_settings_spec_1.getSettingsSpecSelector], function (spec, pickedShapes, settings) {
                if (!spec) {
                    return;
                }
                if (!settings.onElementOut) {
                    return;
                }
                var nextPickedShapes = (0, viewmodel_types_1.isPickedCells)(pickedShapes) ? pickedShapes.length : 0;
                if (prevPickedShapes !== null && prevPickedShapes > 0 && nextPickedShapes === 0) {
                    settings.onElementOut();
                }
                prevPickedShapes = nextPickedShapes;
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementOutCaller = createOnElementOutCaller;
//# sourceMappingURL=on_element_out_caller.js.map