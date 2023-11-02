"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExternalTooltipVisibleSelector = void 0;
const get_internal_main_projection_area_1 = require("./get_internal_main_projection_area");
const get_settings_spec_1 = require("./get_settings_spec");
const has_external_pointer_event_1 = require("./has_external_pointer_event");
const get_computed_scales_1 = require("../../chart_types/xy_chart/state/selectors/get_computed_scales");
const specs_1 = require("../../specs");
const common_1 = require("../../utils/common");
const create_selector_1 = require("../create_selector");
const getExternalEventPointer = ({ externalEvents: { pointer } }) => pointer;
exports.isExternalTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_settings_spec_1.getSettingsSpecSelector,
    has_external_pointer_event_1.hasExternalEventSelector,
    getExternalEventPointer,
    get_computed_scales_1.getComputedScalesSelector,
    get_internal_main_projection_area_1.getInternalMainProjectionAreaSelector,
], ({ externalPointerEvents }, hasExternalEvent, pointer, { xScale }, chartDimensions) => {
    var _a, _b;
    if (!pointer ||
        pointer.type !== specs_1.PointerEventType.Over ||
        (0, common_1.isNil)(pointer.x) ||
        ((_a = externalPointerEvents.tooltip) === null || _a === void 0 ? void 0 : _a.visible) === false) {
        return false;
    }
    const x = xScale.pureScale(pointer.x);
    if (Number.isNaN(x) || x > chartDimensions.width + chartDimensions.left || x < 0) {
        return false;
    }
    return Boolean(hasExternalEvent && ((_b = externalPointerEvents.tooltip) === null || _b === void 0 ? void 0 : _b.visible));
});
//# sourceMappingURL=is_external_tooltip_visible.js.map