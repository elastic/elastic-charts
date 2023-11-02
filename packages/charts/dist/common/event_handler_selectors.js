"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnElementOverSelector = exports.getOnElementOutSelector = exports.getOnElementClickSelector = void 0;
const utils_1 = require("../state/utils");
const getOnElementClickSelector = (prev) => (spec, lastClick, settings, pickedShapes) => {
    if (!spec) {
        return;
    }
    if (!settings.onElementClick) {
        return;
    }
    const nextPickedShapesLength = pickedShapes.length;
    if (nextPickedShapesLength > 0 && (0, utils_1.isClicking)(prev.click, lastClick) && settings && settings.onElementClick) {
        const elements = pickedShapes.map((values) => [
            values,
            {
                specId: spec.id,
                key: `spec{${spec.id}}`,
            },
        ]);
        settings.onElementClick(elements);
    }
    prev.click = lastClick;
};
exports.getOnElementClickSelector = getOnElementClickSelector;
const getOnElementOutSelector = (prev) => (spec, pickedShapes, settings) => {
    if (!spec) {
        return;
    }
    if (!settings.onElementOut) {
        return;
    }
    const nextPickedShapes = pickedShapes.length;
    if (prev.pickedShapes !== null && prev.pickedShapes > 0 && nextPickedShapes === 0) {
        settings.onElementOut();
    }
    prev.pickedShapes = nextPickedShapes;
};
exports.getOnElementOutSelector = getOnElementOutSelector;
function isNewPickedShapes(prevPickedShapes, nextPickedShapes) {
    if (nextPickedShapes.length === 0) {
        return;
    }
    if (nextPickedShapes.length !== prevPickedShapes.length) {
        return true;
    }
    return !nextPickedShapes.every((nextPickedShapeValues, index) => {
        const prevPickedShapeValues = prevPickedShapes[index];
        if (!prevPickedShapeValues) {
            return false;
        }
        if (prevPickedShapeValues.length !== nextPickedShapeValues.length) {
            return false;
        }
        return nextPickedShapeValues.every((layerValue, i) => {
            const prevPickedValue = prevPickedShapeValues[i];
            if (!prevPickedValue) {
                return false;
            }
            return layerValue.value === prevPickedValue.value && layerValue.groupByRollup === prevPickedValue.groupByRollup;
        });
    });
}
const getOnElementOverSelector = (prev) => (spec, nextPickedShapes, settings) => {
    if (!spec || !settings.onElementOver)
        return;
    if (isNewPickedShapes(prev.pickedShapes, nextPickedShapes)) {
        const elements = nextPickedShapes.map((values) => [
            values,
            {
                specId: spec.id,
                key: `spec{${spec.id}}`,
            },
        ]);
        settings.onElementOver(elements);
    }
    prev.pickedShapes = nextPickedShapes;
};
exports.getOnElementOverSelector = getOnElementOverSelector;
//# sourceMappingURL=event_handler_selectors.js.map