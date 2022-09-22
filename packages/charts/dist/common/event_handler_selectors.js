"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnElementOverSelector = exports.getOnElementOutSelector = exports.getOnElementClickSelector = void 0;
var utils_1 = require("../state/utils");
var getOnElementClickSelector = function (prev) {
    return function (spec, lastClick, settings, pickedShapes) {
        if (!spec) {
            return;
        }
        if (!settings.onElementClick) {
            return;
        }
        var nextPickedShapesLength = pickedShapes.length;
        if (nextPickedShapesLength > 0 && (0, utils_1.isClicking)(prev.click, lastClick) && settings && settings.onElementClick) {
            var elements = pickedShapes.map(function (values) { return [
                values,
                {
                    specId: spec.id,
                    key: "spec{".concat(spec.id, "}"),
                },
            ]; });
            settings.onElementClick(elements);
        }
        prev.click = lastClick;
    };
};
exports.getOnElementClickSelector = getOnElementClickSelector;
var getOnElementOutSelector = function (prev) {
    return function (spec, pickedShapes, settings) {
        if (!spec) {
            return;
        }
        if (!settings.onElementOut) {
            return;
        }
        var nextPickedShapes = pickedShapes.length;
        if (prev.pickedShapes !== null && prev.pickedShapes > 0 && nextPickedShapes === 0) {
            settings.onElementOut();
        }
        prev.pickedShapes = nextPickedShapes;
    };
};
exports.getOnElementOutSelector = getOnElementOutSelector;
function isNewPickedShapes(prevPickedShapes, nextPickedShapes) {
    if (nextPickedShapes.length === 0) {
        return;
    }
    if (nextPickedShapes.length !== prevPickedShapes.length) {
        return true;
    }
    return !nextPickedShapes.every(function (nextPickedShapeValues, index) {
        var prevPickedShapeValues = prevPickedShapes[index];
        if (prevPickedShapeValues === null) {
            return false;
        }
        if (prevPickedShapeValues.length !== nextPickedShapeValues.length) {
            return false;
        }
        return nextPickedShapeValues.every(function (layerValue, i) {
            var prevPickedValue = prevPickedShapeValues[i];
            if (!prevPickedValue) {
                return false;
            }
            return layerValue.value === prevPickedValue.value && layerValue.groupByRollup === prevPickedValue.groupByRollup;
        });
    });
}
var getOnElementOverSelector = function (prev) {
    return function (spec, nextPickedShapes, settings) {
        if (!spec || !settings.onElementOver)
            return;
        if (isNewPickedShapes(prev.pickedShapes, nextPickedShapes)) {
            var elements = nextPickedShapes.map(function (values) { return [
                values,
                {
                    specId: spec.id,
                    key: "spec{".concat(spec.id, "}"),
                },
            ]; });
            settings.onElementOver(elements);
        }
        prev.pickedShapes = nextPickedShapes;
    };
};
exports.getOnElementOverSelector = getOnElementOverSelector;
//# sourceMappingURL=event_handler_selectors.js.map