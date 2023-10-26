"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnnotationHoverParamsFn = void 0;
const specs_1 = require("./../../utils/specs");
const common_1 = require("../../../../utils/common");
const time_functions_1 = require("../../../../utils/time_functions");
const DEFAULT_ANNOTATION_ANIMATION_OPTIONS = {
    enabled: true,
    duration: 250,
    delay: 50,
    snapValues: [],
    timeFunction: time_functions_1.TimeFunction.easeInOut,
};
const getAnnotationHoverParamsFn = (hoveredElementIds, styles, animations = []) => (id) => {
    const fadeOutConfig = animations.find(({ trigger }) => trigger === specs_1.AnnotationAnimationTrigger.FadeOnFocusingOthers);
    const isHighlighted = hoveredElementIds.includes(id);
    const style = hoveredElementIds.length === 0 || !fadeOutConfig
        ? styles.default
        : isHighlighted
            ? styles.highlighted
            : styles.unhighlighted;
    const shouldTransition = !isHighlighted && hoveredElementIds.length > 0;
    return {
        style,
        isHighlighted,
        shouldTransition,
        options: (0, common_1.mergePartial)(DEFAULT_ANNOTATION_ANIMATION_OPTIONS, fadeOutConfig === null || fadeOutConfig === void 0 ? void 0 : fadeOutConfig.options),
    };
};
exports.getAnnotationHoverParamsFn = getAnnotationHoverParamsFn;
//# sourceMappingURL=utils.js.map