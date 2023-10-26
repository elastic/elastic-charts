"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOverCaller = void 0;
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const picked_shapes_1 = require("./picked_shapes");
const __1 = require("../../..");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const common_1 = require("../../../../utils/common");
const viewmodel_types_1 = require("../../layout/types/viewmodel_types");
function isOverElement(prev, next) {
    if (next.length === 0) {
        return;
    }
    if (next.length !== prev.length) {
        return true;
    }
    return !next.every((nextCell, index) => {
        const prevCell = prev[index];
        if ((0, common_1.isNil)(prevCell)) {
            return false;
        }
        return nextCell.value === prevCell.value && nextCell.x === prevCell.x && nextCell.y === prevCell.y;
    });
}
function createOnElementOverCaller() {
    let prevPickedShapes = [];
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            selector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, picked_shapes_1.getPickedShapes, get_settings_spec_1.getSettingsSpecSelector], (spec, nextPickedShapes, settings) => {
                if (!spec) {
                    return;
                }
                if (!settings.onElementOver) {
                    return;
                }
                if (!(0, viewmodel_types_1.isPickedCells)(nextPickedShapes)) {
                    return;
                }
                if (isOverElement(prevPickedShapes, nextPickedShapes)) {
                    const elements = nextPickedShapes.map((value) => [
                        value,
                        {
                            specId: spec.id,
                            key: `spec{${spec.id}}`,
                        },
                    ]);
                    settings.onElementOver(elements);
                }
                prevPickedShapes = nextPickedShapes;
            });
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementOverCaller = createOnElementOverCaller;
//# sourceMappingURL=on_element_over_caller.js.map