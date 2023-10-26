"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectedPointerPositionSelector = void 0;
const compute_chart_dimensions_1 = require("./compute_chart_dimensions");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_active_pointer_position_1 = require("../../../../state/selectors/get_active_pointer_position");
exports.getProjectedPointerPositionSelector = (0, create_selector_1.createCustomCachedSelector)([get_active_pointer_position_1.getActivePointerPosition, compute_chart_dimensions_1.computeChartDimensionsSelector, compute_small_multiple_scales_1.computeSmallMultipleScalesSelector], (currentPointerPosition, { chartDimensions }, smallMultipleScales) => getProjectedPointerPosition(currentPointerPosition, chartDimensions, smallMultipleScales));
function getProjectedPointerPosition(chartAreaPointerPosition, { left, top, width, height }, { horizontal, vertical }) {
    const { x, y } = chartAreaPointerPosition;
    let xPos = x - left;
    let yPos = y - top;
    if (xPos < 0 || xPos >= width) {
        xPos = -1;
    }
    if (yPos < 0 || yPos >= height) {
        yPos = -1;
    }
    const h = getPosRelativeToPanel(horizontal, xPos);
    const v = getPosRelativeToPanel(vertical, yPos);
    return {
        x: h.pos,
        y: v.pos,
        horizontalPanelValue: h.value,
        verticalPanelValue: v.value,
    };
}
function getPosRelativeToPanel(panelScale, pos) {
    var _a, _b;
    const outerPadding = panelScale.outerPadding * panelScale.step;
    const innerPadding = panelScale.innerPadding * panelScale.step;
    const numOfDomainSteps = panelScale.domain.length;
    const rangeWithoutOuterPaddings = numOfDomainSteps * panelScale.bandwidth + (numOfDomainSteps - 1) * innerPadding;
    if (pos < outerPadding || pos > outerPadding + rangeWithoutOuterPaddings) {
        return { pos: -1, value: null };
    }
    const posWOInitialOuterPadding = pos - outerPadding;
    const minEqualSteps = (numOfDomainSteps - 1) * panelScale.step;
    if (posWOInitialOuterPadding <= minEqualSteps) {
        const relativePosIndex = Math.floor(posWOInitialOuterPadding / panelScale.step);
        const relativePos = posWOInitialOuterPadding - panelScale.step * relativePosIndex;
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