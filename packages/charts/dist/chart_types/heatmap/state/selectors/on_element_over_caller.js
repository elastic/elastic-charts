"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOverCaller = void 0;
var __1 = require("../../..");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var viewmodel_types_1 = require("../../layout/types/viewmodel_types");
var heatmap_spec_1 = require("./heatmap_spec");
var picked_shapes_1 = require("./picked_shapes");
function isOverElement(prev, next) {
    if (next.length === 0) {
        return;
    }
    if (next.length !== prev.length) {
        return true;
    }
    return !next.every(function (nextCell, index) {
        var prevCell = prev[index];
        if (prevCell === null) {
            return false;
        }
        return nextCell.value === prevCell.value && nextCell.x === prevCell.x && nextCell.y === prevCell.y;
    });
}
function createOnElementOverCaller() {
    var prevPickedShapes = [];
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.Heatmap) {
            selector = (0, create_selector_1.createCustomCachedSelector)([heatmap_spec_1.getSpecOrNull, picked_shapes_1.getPickedShapes, get_settings_spec_1.getSettingsSpecSelector], function (spec, nextPickedShapes, settings) {
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
                    var elements = nextPickedShapes.map(function (value) { return [
                        value,
                        {
                            specId: spec.id,
                            key: "spec{".concat(spec.id, "}"),
                        },
                    ]; });
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