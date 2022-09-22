"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExternalTooltipVisibleSelector = void 0;
var compute_chart_dimensions_1 = require("../../chart_types/xy_chart/state/selectors/compute_chart_dimensions");
var get_computed_scales_1 = require("../../chart_types/xy_chart/state/selectors/get_computed_scales");
var specs_1 = require("../../specs");
var common_1 = require("../../utils/common");
var create_selector_1 = require("../create_selector");
var get_settings_spec_1 = require("./get_settings_spec");
var has_external_pointer_event_1 = require("./has_external_pointer_event");
var getExternalEventPointer = function (_a) {
    var pointer = _a.externalEvents.pointer;
    return pointer;
};
exports.isExternalTooltipVisibleSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_settings_spec_1.getSettingsSpecSelector,
    has_external_pointer_event_1.hasExternalEventSelector,
    getExternalEventPointer,
    get_computed_scales_1.getComputedScalesSelector,
    compute_chart_dimensions_1.computeChartDimensionsSelector,
], function (_a, hasExternalEvent, pointer, _b, _c) {
    var _d, _e;
    var externalPointerEvents = _a.externalPointerEvents;
    var xScale = _b.xScale;
    var chartDimensions = _c.chartDimensions;
    if (!pointer ||
        pointer.type !== specs_1.PointerEventType.Over ||
        (0, common_1.isNil)(pointer.x) ||
        ((_d = externalPointerEvents.tooltip) === null || _d === void 0 ? void 0 : _d.visible) === false) {
        return false;
    }
    var x = xScale.pureScale(pointer.x);
    if (Number.isNaN(x) || x > chartDimensions.width + chartDimensions.left || x < 0) {
        return false;
    }
    return Boolean(hasExternalEvent && ((_e = externalPointerEvents.tooltip) === null || _e === void 0 ? void 0 : _e.visible));
});
//# sourceMappingURL=is_external_tooltip_visible.js.map