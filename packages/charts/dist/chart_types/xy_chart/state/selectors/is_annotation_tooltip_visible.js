"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnnotationTooltipVisibleSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_annotation_tooltip_state_1 = require("./get_annotation_tooltip_state");
exports.isAnnotationTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([get_annotation_tooltip_state_1.getAnnotationTooltipStateSelector], function (annotationTooltipState) { return annotationTooltipState !== null && annotationTooltipState.isVisible; });
//# sourceMappingURL=is_annotation_tooltip_visible.js.map