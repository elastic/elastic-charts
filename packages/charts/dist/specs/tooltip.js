"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tooltip = exports.DEFAULT_TOOLTIP_SPEC = exports.tooltipBuildProps = exports.getTooltipType = exports.isFollowTooltipType = exports.isCrosshairTooltipType = void 0;
const constants_1 = require("./constants");
const chart_types_1 = require("../chart_types");
const spec_factory_1 = require("../state/spec_factory");
const common_1 = require("../utils/common");
function isCrosshairTooltipType(type) {
    return type === constants_1.TooltipType.VerticalCursor || type === constants_1.TooltipType.Crosshairs;
}
exports.isCrosshairTooltipType = isCrosshairTooltipType;
function isFollowTooltipType(type) {
    return type === constants_1.TooltipType.Follow;
}
exports.isFollowTooltipType = isFollowTooltipType;
function getTooltipType(tooltip, settings, externalTooltip = false) {
    if (!externalTooltip)
        return tooltip.type;
    const { visible } = settings.externalPointerEvents.tooltip;
    return visible ? constants_1.TooltipType.VerticalCursor : constants_1.TooltipType.None;
}
exports.getTooltipType = getTooltipType;
exports.tooltipBuildProps = (0, spec_factory_1.buildSFProps)()({
    id: '__global__tooltip___',
    chartType: chart_types_1.ChartType.Global,
    specType: constants_1.SpecType.Tooltip,
}, {
    type: constants_1.TooltipType.VerticalCursor,
    snap: true,
    showNullValues: false,
    actions: [],
    actionPrompt: 'Right-click to show actions',
    pinningPrompt: 'Right-click to pin tooltip',
    selectionPrompt: 'Please select a series',
    actionsLoading: 'Loading Actions...',
    noActionsLoaded: 'No actions available',
    maxTooltipItems: 10,
    maxVisibleTooltipItems: 10,
    header: 'default',
    body: 'default',
    footer: 'default',
});
exports.DEFAULT_TOOLTIP_SPEC = {
    ...exports.tooltipBuildProps.defaults,
    ...exports.tooltipBuildProps.overrides,
};
const Tooltip = function (props) {
    const { defaults, overrides } = exports.tooltipBuildProps;
    (0, spec_factory_1.useSpecFactory)({
        ...defaults,
        ...(0, common_1.stripUndefined)(props),
        ...overrides,
    });
    return null;
};
exports.Tooltip = Tooltip;
//# sourceMappingURL=tooltip.js.map