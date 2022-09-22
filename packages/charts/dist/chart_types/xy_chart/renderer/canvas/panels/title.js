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
exports.renderTitle = void 0;
var common_1 = require("../../../../../utils/common");
var dimensions_1 = require("../../../../../utils/dimensions");
var axis_type_utils_1 = require("../../../utils/axis_type_utils");
var axis_utils_1 = require("../../../utils/axis_utils");
var text_1 = require("../primitives/text");
var debug_1 = require("../utils/debug");
var titleFontDefaults = {
    fontVariant: 'normal',
    fontStyle: 'normal',
    fontWeight: 'bold',
    align: 'center',
    baseline: 'middle',
};
function renderTitle(ctx, panel, _a) {
    var _b = _a.size, width = _b.width, height = _b.height, _c = _a.dimension, maxLabelBboxWidth = _c.maxLabelBboxWidth, maxLabelBboxHeight = _c.maxLabelBboxHeight, _d = _a.axisSpec, position = _d.position, hideAxis = _d.hide, title = _d.title, timeAxisLayerCount = _d.timeAxisLayerCount, _e = _a.axisStyle, axisPanelTitle = _e.axisPanelTitle, axisTitle = _e.axisTitle, tickLabel = _e.tickLabel, tickLine = _e.tickLine, panelTitle = _a.panelTitle, debug = _a.debug, anchorPoint = _a.anchorPoint;
    var titleToRender = panel ? panelTitle : title;
    var axisTitleToUse = panel ? axisPanelTitle : axisTitle;
    if (!titleToRender || !axisTitleToUse.visible) {
        return;
    }
    var otherAxisTitleToUse = panel ? axisTitle : axisPanelTitle;
    var otherTitle = panel ? title : panelTitle;
    var horizontal = (0, axis_type_utils_1.isHorizontalAxis)(position);
    var font = __assign(__assign(__assign({}, titleFontDefaults), axisTitleToUse), { textColor: axisTitleToUse.fill });
    var tickDimension = (0, axis_utils_1.shouldShowTicks)(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
    var maxLabelBoxGirth = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
    var allLayersGirth = (0, axis_utils_1.getAllAxisLayersGirth)(timeAxisLayerCount, maxLabelBoxGirth, horizontal);
    var labelPaddingSum = (0, dimensions_1.innerPad)(tickLabel.padding) + (0, dimensions_1.outerPad)(tickLabel.padding);
    var labelSize = tickLabel.visible ? allLayersGirth + labelPaddingSum : 0;
    var otherTitleDimension = otherTitle ? (0, axis_utils_1.getTitleDimension)(otherAxisTitleToUse) : 0;
    var titlePadding = panel || (axisTitleToUse.visible && title) ? axisTitleToUse.padding : 0;
    var rotation = horizontal ? 0 : -90;
    var offset = position === common_1.Position.Left || position === common_1.Position.Top
        ? (0, dimensions_1.outerPad)(titlePadding) + (panel ? otherTitleDimension : 0)
        : tickDimension + labelSize + (0, dimensions_1.innerPad)(titlePadding) + (panel ? 0 : otherTitleDimension);
    var x = anchorPoint.x + (horizontal ? 0 : offset);
    var y = anchorPoint.y + (horizontal ? offset : height);
    var textX = horizontal ? width / 2 + (panel ? 0 : x) : font.fontSize / 2 + (panel ? offset : x);
    var textY = horizontal ? font.fontSize / 2 + (panel ? offset : y) : (panel ? height : -height + 2 * y) / 2;
    if (debug)
        (0, debug_1.renderDebugRect)(ctx, { x: x, y: y, width: horizontal ? width : height, height: font.fontSize }, rotation);
    (0, text_1.renderText)(ctx, { x: textX, y: textY }, titleToRender !== null && titleToRender !== void 0 ? titleToRender : '', font, rotation);
}
exports.renderTitle = renderTitle;
//# sourceMappingURL=title.js.map