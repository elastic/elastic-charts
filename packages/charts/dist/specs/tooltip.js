"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tooltip = exports.DEFAULT_TOOLTIP_SPEC = exports.tooltipBuildProps = exports.DEFAULT_TOOLTIP_SNAP = exports.DEFAULT_TOOLTIP_TYPE = exports.getTooltipType = exports.isFollowTooltipType = exports.isCrosshairTooltipType = void 0;
var chart_types_1 = require("../chart_types");
var spec_factory_1 = require("../state/spec_factory");
var common_1 = require("../utils/common");
var constants_1 = require("./constants");
function isCrosshairTooltipType(type) {
    return type === constants_1.TooltipType.VerticalCursor || type === constants_1.TooltipType.Crosshairs;
}
exports.isCrosshairTooltipType = isCrosshairTooltipType;
function isFollowTooltipType(type) {
    return type === constants_1.TooltipType.Follow;
}
exports.isFollowTooltipType = isFollowTooltipType;
function getTooltipType(tooltip, settings, externalTooltip) {
    if (externalTooltip === void 0) { externalTooltip = false; }
    if (!externalTooltip)
        return tooltip.type;
    var visible = settings.externalPointerEvents.tooltip.visible;
    return visible ? constants_1.TooltipType.VerticalCursor : constants_1.TooltipType.None;
}
exports.getTooltipType = getTooltipType;
exports.DEFAULT_TOOLTIP_TYPE = constants_1.TooltipType.VerticalCursor;
exports.DEFAULT_TOOLTIP_SNAP = true;
exports.tooltipBuildProps = (0, spec_factory_1.buildSFProps)()({
    id: '__global__tooltip___',
    chartType: chart_types_1.ChartType.Global,
    specType: constants_1.SpecType.Tooltip,
}, {
    type: constants_1.TooltipType.VerticalCursor,
    snap: true,
    showNullValues: false,
    actions: [],
    actionPrompt: 'Right click to pin tooltip',
    selectionPrompt: 'Please select a series',
});
exports.DEFAULT_TOOLTIP_SPEC = __assign(__assign({}, exports.tooltipBuildProps.defaults), exports.tooltipBuildProps.overrides);
var Tooltip = function (props) {
    var defaults = exports.tooltipBuildProps.defaults, overrides = exports.tooltipBuildProps.overrides;
    (0, spec_factory_1.useSpecFactory)(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides));
    return null;
};
exports.Tooltip = Tooltip;
//# sourceMappingURL=tooltip.js.map