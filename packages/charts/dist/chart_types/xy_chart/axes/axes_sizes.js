"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAxesDimensions = void 0;
var common_1 = require("../../../utils/common");
var dimensions_1 = require("../../../utils/dimensions");
var spec_1 = require("../state/utils/spec");
var axis_type_utils_1 = require("../utils/axis_type_utils");
var axis_utils_1 = require("../utils/axis_utils");
var getAxisSizeForLabel = function (axisSpec, _a, axesStyles, _b, smSpec) {
    var _c;
    var sharedAxesStyles = _a.axes, chartMargins = _a.chartMargins;
    var _d = _b.maxLabelBboxWidth, maxLabelBboxWidth = _d === void 0 ? 0 : _d, _e = _b.maxLabelBboxHeight, maxLabelBboxHeight = _e === void 0 ? 0 : _e;
    var _f = (_c = axesStyles.get(axisSpec.id)) !== null && _c !== void 0 ? _c : sharedAxesStyles, tickLine = _f.tickLine, axisTitle = _f.axisTitle, axisPanelTitle = _f.axisPanelTitle, tickLabel = _f.tickLabel;
    var horizontal = (0, axis_type_utils_1.isHorizontalAxis)(axisSpec.position);
    var maxLabelBoxGirth = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
    var allLayersGirth = (0, axis_utils_1.getAllAxisLayersGirth)(axisSpec.timeAxisLayerCount, maxLabelBoxGirth, horizontal);
    var hasPanelTitle = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position) ? smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitVertically : smSpec === null || smSpec === void 0 ? void 0 : smSpec.splitHorizontally;
    var panelTitleDimension = hasPanelTitle ? (0, axis_utils_1.getTitleDimension)(axisPanelTitle) : 0;
    var titleDimension = axisSpec.title ? (0, axis_utils_1.getTitleDimension)(axisTitle) : 0;
    var tickDimension = (0, axis_utils_1.shouldShowTicks)(tickLine, axisSpec.hide) ? tickLine.size + tickLine.padding : 0;
    var labelPaddingSum = tickLabel.visible ? (0, dimensions_1.innerPad)(tickLabel.padding) + (0, dimensions_1.outerPad)(tickLabel.padding) : 0;
    var axisDimension = labelPaddingSum + tickDimension + titleDimension + panelTitleDimension;
    var maxAxisGirth = axisDimension + (tickLabel.visible ? allLayersGirth : 0);
    var maxLabelBoxHalfLength = ((0, axis_type_utils_1.isVerticalAxis)(axisSpec.position) ? maxLabelBboxHeight : maxLabelBboxWidth) / 2;
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
    var sizes = __spreadArray([], __read(axisDimensions), false).reduce(function (acc, _a) {
        var _b = __read(_a, 2), id = _b[0], tickLabelBounds = _b[1];
        var axisSpec = (0, spec_1.getSpecsById)(axisSpecs, id);
        if (tickLabelBounds.isHidden || !axisSpec)
            return acc;
        var _c = getAxisSizeForLabel(axisSpec, theme, axesStyles, tickLabelBounds, smSpec), top = _c.top, bottom = _c.bottom, left = _c.left, right = _c.right;
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
    var left = Math.max(sizes.axisLabelOverflow.left + theme.chartMargins.left, sizes.axisMainSize.left);
    var right = Math.max(sizes.axisLabelOverflow.right + theme.chartMargins.right, sizes.axisMainSize.right);
    var top = Math.max(sizes.axisLabelOverflow.top + theme.chartMargins.top, sizes.axisMainSize.top);
    var bottom = Math.max(sizes.axisLabelOverflow.bottom + theme.chartMargins.bottom, sizes.axisMainSize.bottom);
    return { left: left, right: right, top: top, bottom: bottom, margin: { left: left - sizes.axisMainSize.left } };
}
exports.getAxesDimensions = getAxesDimensions;
//# sourceMappingURL=axes_sizes.js.map