"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementClickCaller = void 0;
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const picked_shapes_1 = require("./picked_shapes");
const __1 = require("../../..");
const create_selector_1 = require("../../../../state/create_selector");
const get_last_click_1 = require("../../../../state/selectors/get_last_click");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const utils_1 = require("../../../../state/utils");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
function createOnElementClickCaller() {
    let prevClick = null;
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, get_last_click_1.getLastClickSelector, get_settings_spec_1.getSettingsSpecSelector, picked_shapes_1.getPickedShapes], (spec, lastClick, settings, pickedShapes) => {
                if (!spec) {
                    return;
                }
                if (!settings.onElementClick) {
                    return;
                }
                if (!(0, viewmodel_types_1.isPickedCells)(pickedShapes)) {
                    return;
                }
                const nextPickedShapesLength = pickedShapes.length;
                if (nextPickedShapesLength > 0 && (0, utils_1.isClicking)(prevClick, lastClick)) {
                    const elements = pickedShapes.map((value) => [
                        value,
                        {
                            specId: spec.id,
                            key: `spec{${spec.id}}`,
                        },
                    ]);
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