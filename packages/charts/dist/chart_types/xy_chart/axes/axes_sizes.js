"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxesDimensions = void 0;
const common_1 = require("../../../utils/common");
const dimensions_1 = require("../../../utils/dimensions");
const spec_1 = require("../state/utils/spec");
const axis_type_utils_1 = require("../utils/axis_type_utils");
const axis_utils_1 = require("../utils/axis_utils");
const getAxisSizeForLabel = (axisSpec, { axes: sharedAxesStyles, chartMargins }, axesStyles, { maxLabelBboxWidth = 0, maxLabelBboxHeight = 0 }, smSpec) => {
    var _a;
    const { tickLine, axisTitle, axisPanelTitle, tickLabel } = (_a = axesStyles.get(axisSpec.id)) !== null && _a !== void 0 ? _a : sharedAxesStyles;
    const horizontal = (0, axis_type_utils_1.isHorizontalAxis)(axisSpec.position);
    const maxLabelBoxGirth = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
    const allLayersGirth = (0, axis_utils_1.getAllAxisLayersGirth)(axisSpec.timeAxisLayerCount, maxLabelBoxGirth, horizontal);
    const hasPanelTitle = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position) ? smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitVertically : smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitHorizontally;
    const panelTitleDimension = hasPanelTitle ? (0, axis_utils_1.getTitleDimension)(axisPanelTitle) : 0;
    const titleDimension = axisSpec.title ? (0, axis_utils_1.getTitleDimension)(axisTitle) : 0;
    const tickDimension = (0, axis_utils_1.shouldShowTicks)(tickLine, axisSpec.hide) ? tickLine.size + tickLine.padding : 0;
    const labelPaddingSum = tickLabel.visible ? (0, dimensions_1.innerPad)(tickLabel.padding) + (0, dimensions_1.outerPad)(tickLabel.padding) : 0;
    const axisDimension = labelPaddingSum + tickDimension + titleDimension + panelTitleDimension;
    const maxAxisGirth = axisDimension + (tickLabel.visible ? allLayersGirth : 0);
    const maxLabelBoxHalfLength = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position)
        ? maxLabelBboxHeight / 2
        : axisSpec.timeAxisLayerCount > 0
            ? 0
            : maxLabelBboxWidth / 2;
    return horizontal
        ? {
            top: axisSpec.position === common_1.Position.Top ? maxAxisGirth + chartMargins.top : 0,
            bottom: axisSpec.position === common_1.Position.Bottom ? maxAxisGirth + chartMargins.bottom : 0,
            left: maxLabelBoxHalfLength,
            right: maxLabelBoxHalfLength,
        }
        : {
            top: maxLabelBoxHalfLength,
            bottom: maxLabelBoxHalfLength,
            left: axisSpec.position === common_1.Position.Left ? maxAxisGirth + chartMargins.left : 0,
            right: axisSpec.position === common_1.Position.Right ? maxAxisGirth + chartMargins.right : 0,
        };
};
function getAxesDimensions(theme, axisDimensions, axesStyles, axisSpecs, smSpec) {
    const sizes = [...axisDimensions].reduce((acc, [id, tickLabelBounds]) => {
        const axisSpec = (0, spec_1.getSpecsById)(axisSpecs, id);
        if (tickLabelBounds.isHidden || !axisSpec)
            return acc;
        const { top, bottom, left, right } = getAxisSizeForLabel(axisSpec, theme, axesStyles, tickLabelBounds, smSpec);
        if ((0, axis_type_utils_1.isVerticalAxis)(axisSpec.position)) {
            acc.axisLabelOverflow.top = Math.max(acc.axisLabelOverflow.top, top);
            acc.axisLabelOverflow.bottom = Math.max(acc.axisLabelOverflow.bottom, bottom);
            acc.axisMainSize.left += left;
            acc.axisMainSize.right += right;
        }
        else {
            acc.axisMainSize.top += top;
            acc.axisMainSize.bottom += bottom;
            acc.axisLabelOverflow.left = Math.max(acc.axisLabelOverflow.left, left);
            acc.axisLabelOverflow.right = Math.max(acc.axisLabelOverflow.right, right);
        }
        return acc;
    }, {
        axisMainSize: { left: 0, right: 0, top: 0, bottom: 0 },
        axisLabelOverflow: { left: 0, right: 0, top: 0, bottom: 0 },
    });
    const left = Math.max(sizes.axisLabelOverflow.left + theme.chartMargins.left, sizes.axisMainSize.left);
    const right = Math.max(sizes.axisLabelOverflow.right + theme.chartMargins.right, sizes.axisMainSize.right);
    const top = Math.max(sizes.axisLabelOverflow.top + theme.chartMargins.top, sizes.axisMainSize.top);
    const bottom = Math.max(sizes.axisLabelOverflow.bottom + theme.chartMargins.bottom, sizes.axisMainSize.bottom);
    return { left, right, top, bottom, margin: { left: left - sizes.axisMainSize.left } };
}
exports.getAxesDimensions = getAxesDimensions;
//# sourceMappingURL=axes_sizes.js.map