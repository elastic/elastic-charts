"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectedPointerPositionSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
var compute_chart_dimensions_1 = require("./compute_chart_dimensions");
var compute_small_multiple_scales_1 = require("./compute_small_multiple_scales");
exports.getProjectedPointerPositionSelector = (0, create_selector_1.createCustomCachedSelector)([get_active_pointer_position_1.getActivePointerPosition, compute_chart_dimensions_1.computeChartDimensionsSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], function (currentPointerPosition, _a, smallMultipleScales) {
    var chartDimensions = _a.chartDimensions;
    return getProjectedPointerPosition(currentPointerPosition, chartDimensions, smallMultipleScales);
});
function getProjectedPointerPosition(chartAreaPointerPosition, _a, _b) {
    var left = _a.left, top = _a.top, width = _a.width, height = _a.height;
    var horizontal = _b.horizontal, vertical = _b.vertical;
    var x = chartAreaPointerPosition.x, y = chartAreaPointerPosition.y;
    var xPos = x - left;
    var yPos = y - top;
    if (xPos < 0 || xPos >= width) {
        xPos = -1;
    }
    if (yPos < 0 || yPos >= height) {
        yPos = -1;
    }
    var h = getPosRelativeToPanel(horizontal, xPos);
    var v = getPosRelativeToPanel(vertical, yPos);
    return {
        x: h.pos,
        y: v.pos,
        horizontalPanelValue: h.value,
        verticalPanelValue: v.value,
    };
}
function getPosRelativeToPanel(panelScale, pos) {
    var _a, _b;
    var outerPadding = panelScale.outerPadding * panelScale.step;
    var innerPadding = panelScale.innerPadding * panelScale.step;
    var numOfDomainSteps = panelScale.domain.length;
    var rangeWithoutOuterPaddings = numOfDomainSteps * panelScale.bandwidth + (numOfDomainSteps - 1) * innerPadding;
    if (pos < outerPadding || pos > outerPadding + rangeWithoutOuterPaddings) {
        return { pos: -1, value: null };
    }
    var posWOInitialOuterPadding = pos - outerPadding;
    var minEqualSteps = (numOfDomainSteps - 1) * panelScale.step;
    if (posWOInitialOuterPadding <= minEqualSteps) {
        var relativePosIndex = Math.floor(posWOInitialOuterPadding / panelScale.step);
        var relativePos = posWOInitialOuterPadding - panelScale.step * relativePosIndex;
        if (relativePos > panelScale.bandwidth) {
            return { pos: -1, value: null };
        }
        return { pos: relativePos, value: (_a = panelScale.domain[relativePosIndex]) !== null && _a !== void 0 ? _a : null };
    }
    return {
        pos: posWOInitialOuterPadding - panelScale.step * (numOfDomainSteps - 1),
        value: (_b = panelScale.domain[numOfDomainSteps - 1]) !== null && _b !== void 0 ? _b : null,
    };
}
//# sourceMappingURL=get_projected_pointer_position.js.map