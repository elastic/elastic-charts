"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotationHoverParamsFn = void 0;
var common_1 = require("../../../../utils/common");
var time_functions_1 = require("../../../../utils/time_functions");
var specs_1 = require("./../../utils/specs");
var DEFAULT_ANNOTATION_ANIMATION_OPTIONS = {
    enabled: true,
    duration: 250,
    delay: 50,
    snapValues: [],
    timeFunction: time_functions_1.TimeFunction.easeInOut,
};
var getAnnotationHoverParamsFn = function (hoveredElementIds, styles, animations) {
    if (animations === void 0) { animations = []; }
    return function (id) {
        var fadeOutConfig = animations.find(function (_a) {
            var trigger = _a.trigger;
            return trigger === specs_1.AnnotationAnimationTrigger.FadeOnFocusingOthers;
        });
        var isHighlighted = hoveredElementIds.includes(id);
        var style = hoveredElementIds.length === 0 || !fadeOutConfig
            ? styles.default
            : isHighlighted
                ? styles.highlighted
                : styles.unhighlighted;
        var shouldTransition = !isHighlighted && hoveredElementIds.length > 0;
        return {
            style: style,
            isHighlighted: isHighlighted,
            shouldTransition: shouldTransition,
            options: (0, common_1.mergePartial)(DEFAULT_ANNOTATION_ANIMATION_OPTIONS, fadeOutConfig === null || fadeOutConfig === void 0 ? void 0 : fadeOutConfig.options),
        };
    };
};
exports.getAnnotationHoverParamsFn = getAnnotationHoverParamsFn;
//# sourceMappingURL=utils.js.map