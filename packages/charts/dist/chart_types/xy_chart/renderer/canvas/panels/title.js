"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTitle = void 0;
const canvas_text_bbox_calculator_1 = require("../../../../../utils/bbox/canvas_text_bbox_calculator");
const common_1 = require("../../../../../utils/common");
const dimensions_1 = require("../../../../../utils/dimensions");
const wrap_1 = require("../../../../../utils/text/wrap");
const axis_type_utils_1 = require("../../../utils/axis_type_utils");
const axis_utils_1 = require("../../../utils/axis_utils");
const text_1 = require("../primitives/text");
const debug_1 = require("../utils/debug");
const titleFontDefaults = {
    fontVariant: 'normal',
    fontStyle: 'normal',
    fontWeight: 'bold',
    align: 'center',
    baseline: 'middle',
};
function renderTitle(ctx, panel, { size: { width, height }, dimension: { maxLabelBboxWidth, maxLabelBboxHeight }, axisSpec: { position, hide: hideAxis, title, timeAxisLayerCount }, axisStyle: { axisPanelTitle, axisTitle, tickLabel, tickLine }, panelTitle, debug, anchorPoint, }, locale) {
    const titleToRender = panel ? panelTitle : title;
    const axisTitleToUse = panel ? axisPanelTitle : axisTitle;
    if (!titleToRender || !axisTitleToUse.visible) {
        return;
    }
    const otherAxisTitleToUse = panel ? axisTitle : axisPanelTitle;
    const otherTitle = panel ? title : panelTitle;
    const horizontal = (0, axis_type_utils_1.isHorizontalAxis)(position);
    const font = { ...titleFontDefaults, ...axisTitleToUse, textColor: axisTitleToUse.fill };
    const tickDimension = (0, axis_utils_1.shouldShowTicks)(tickLine, hideAxis) ? tickLine.size + tickLine.padding : 0;
    const maxLabelBoxGirth = horizontal ? maxLabelBboxHeight : maxLabelBboxWidth;
    const allLayersGirth = (0, axis_utils_1.getAllAxisLayersGirth)(timeAxisLayerCount, maxLabelBoxGirth, horizontal);
    const labelPaddingSum = (0, dimensions_1.innerPad)(tickLabel.padding) + (0, dimensions_1.outerPad)(tickLabel.padding);
    const labelSize = tickLabel.visible ? allLayersGirth + labelPaddingSum : 0;
    const otherTitleDimension = otherTitle ? (0, axis_utils_1.getTitleDimension)(otherAxisTitleToUse) : 0;
    const titlePadding = panel || (axisTitleToUse.visible && title) ? axisTitleToUse.padding : 0;
    const rotation = horizontal ? 0 : -90;
    const offset = position === common_1.Position.Left || position === common_1.Position.Top
        ? (0, dimensions_1.outerPad)(titlePadding) + (panel ? otherTitleDimension : 0)
        : tickDimension + labelSize + (0, dimensions_1.innerPad)(titlePadding) + (panel ? 0 : otherTitleDimension);
    const x = anchorPoint.x + (horizontal ? 0 : offset);
    const y = anchorPoint.y + (horizontal ? offset : height);
    const textX = horizontal ? width / 2 + (panel ? 0 : x) : font.fontSize / 2 + (panel ? offset : x);
    const textY = horizontal ? font.fontSize / 2 + (panel ? offset : y) : (panel ? height : -height + 2 * y) / 2;
    const wrappedText = (0, wrap_1.wrapText)(titleToRender !== null && titleToRender !== void 0 ? titleToRender : '', font, font.fontSize, horizontal ? width : height, 1, (0, canvas_text_bbox_calculator_1.measureText)(ctx), locale);
    if (!wrappedText[0])
        return;
    if (debug)
        (0, debug_1.renderDebugRect)(ctx, { x, y, width: horizontal ? width : height, height: font.fontSize }, rotation);
    (0, text_1.renderText)(ctx, { x: textX, y: textY }, wrappedText[0], font, rotation);
}
exports.renderTitle = renderTitle;
//# sourceMappingURL=title.js.map