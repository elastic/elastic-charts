"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOutCaller = void 0;
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const picked_shapes_1 = require("./picked_shapes");
const __1 = require("../../..");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
function createOnElementOutCaller() {
    let prevPickedShapes = null;
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, picked_shapes_1.getPickedShapes, get_settings_spec_1.getSettingsSpecSelector], (spec, pickedShapes, settings) => {
                if (!spec) {
                    return;
                }
                if (!settings.onElementOut) {
                    return;
                }
                const nextPickedShapes = (0, viewmodel_types_1.isPickedCells)(pickedShapes) ? pickedShapes.length : 0;
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