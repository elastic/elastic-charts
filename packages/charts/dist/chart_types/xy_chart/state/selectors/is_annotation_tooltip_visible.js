"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnnotationTooltipVisibleSelector = void 0;
const get_annotation_tooltip_state_1 = require("./get_annotation_tooltip_state");
const create_selector_1 = require("../../../../state/create_selector");
exports.isAnnotationTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([get_annotation_tooltip_state_1.getAnnotationTooltipStateSelector], (annotationTooltipState) => annotationTooltipState !== null && annotationTooltipState.isVisible);
//# sourceMappingURL=is_annotation_tooltip_visible.js.map