"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkTextLayout = void 0;
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const constants_1 = require("../../../../common/constants");
const fill_text_color_1 = require("../../../../common/fill_text_color");
const geometry_1 = require("../../../../common/geometry");
const text_utils_1 = require("../../../../common/text_utils");
const common_1 = require("../../../../utils/common");
const logger_1 = require("../../../../utils/logger");
function linkTextLayout(rectWidth, rectHeight, measure, style, nodesWithoutRoom, currentY, anchorRadius, rawTextGetter, valueGetter, valueFormatter, maxTextLength, diskCenter, { color: backgroundColor, fallbackColor: fallbackBGColor }) {
    const { linkLabel } = style;
    const maxDepth = nodesWithoutRoom.reduce((p, n) => Math.max(p, n.depth), 0);
    const yRelativeIncrement = Math.sin(linkLabel.stemAngle) * linkLabel.minimumStemLength;
    const rowPitch = linkLabel.fontSize + linkLabel.spacing;
    const linkLabels = nodesWithoutRoom
        .filter((n) => n.depth === maxDepth)
        .sort((n1, n2) => Math.abs(n2.x0 - n2.x1) - Math.abs(n1.x0 - n1.x1))
        .slice(0, linkLabel.maxCount)
        .sort(linkLabelCompare)
        .map(nodeToLinkLabel({
        linkLabel,
        anchorRadius,
        currentY,
        rowPitch,
        yRelativeIncrement,
        rawTextGetter,
        maxTextLength,
        valueFormatter,
        valueGetter,
        measure,
        rectWidth,
        rectHeight,
        diskCenter,
    }))
        .filter(({ text }) => text !== '');
    if ((0, color_library_wrappers_1.colorToRgba)(backgroundColor)[3] < 1) {
        logger_1.Logger.expected('Text contrast requires an opaque background color, using fallbackColor', 'an opaque color', backgroundColor);
    }
    const textColor = linkLabel.textColor === common_1.ColorVariant.Adaptive
        ? (0, fill_text_color_1.fillTextColor)(fallbackBGColor, null, backgroundColor).color.keyword
        : linkLabel.textColor;
    const labelFontSpec = { ...linkLabel, textColor };
    const valueFontSpec = { ...linkLabel, ...linkLabel.valueFont, textColor };
    return { linkLabels, valueFontSpec, labelFontSpec, strokeColor: textColor };
}
exports.linkTextLayout = linkTextLayout;
function linkLabelCompare(n1, n2) {
    const mid1 = (0, geometry_1.meanAngle)(n1.x0, n1.x1);
    const mid2 = (0, geometry_1.meanAngle)(n2.x0, n2.x1);
    const dist1 = Math.min(Math.abs(mid1 - constants_1.TAU / 4), Math.abs(mid1 - (3 * constants_1.TAU) / 4));
    const dist2 = Math.min(Math.abs(mid2 - constants_1.TAU / 4), Math.abs(mid2 - (3 * constants_1.TAU) / 4));
    return dist1 - dist2;
}
function nodeToLinkLabel({ linkLabel, anchorRadius, currentY, rowPitch, yRelativeIncrement, rawTextGetter, maxTextLength, valueFormatter, valueGetter, measure, rectWidth, rectHeight, diskCenter, }) {
    const labelFont = linkLabel;
    const valueFont = { ...labelFont, ...linkLabel.valueFont };
    return function nodeToLinkLabelMap(node) {
        var _a;
        const midAngle = (0, geometry_1.trueBearingToStandardPositionAngle)((node.x0 + node.x1) / 2);
        const north = midAngle < constants_1.TAU / 2 ? 1 : -1;
        const rightSide = constants_1.TAU / 4 < midAngle && midAngle < (3 * constants_1.TAU) / 4 ? 0 : 1;
        const west = rightSide ? 1 : -1;
        const cos = Math.cos(midAngle);
        const sin = Math.sin(midAngle);
        const x0 = cos * anchorRadius;
        const y0 = sin * anchorRadius;
        const x = cos * (anchorRadius + linkLabel.radiusPadding);
        const y = sin * (anchorRadius + linkLabel.radiusPadding);
        const stemFromX = x;
        const stemFromY = y;
        const poolIndex = rightSide + (1 - north);
        const relativeY = north * y;
        const yOffset = Math.max(((_a = currentY[poolIndex]) !== null && _a !== void 0 ? _a : 0) + rowPitch, relativeY + yRelativeIncrement, rowPitch / 2);
        currentY[poolIndex] = yOffset;
        const cy = north * yOffset;
        const stemToX = x + north * west * cy - west * relativeY;
        const stemToY = cy;
        const translateX = stemToX + west * (linkLabel.horizontalStemLength + linkLabel.gap);
        const translate = [translateX, stemToY];
        const linkLabels = [
            [x0, y0],
            [stemFromX, stemFromY],
            [stemToX, stemToY],
            [stemToX + west * linkLabel.horizontalStemLength, stemToY],
        ];
        const rawLabelText = rawTextGetter(node);
        const isRTL = (0, common_1.isRTLString)(rawLabelText);
        const valueText = valueFormatter(valueGetter(node));
        const valueWidth = (0, text_utils_1.measureOneBoxWidth)(measure, linkLabel.fontSize, {
            ...valueFont,
            text: valueText,
            isValue: false,
        });
        const widthAdjustment = valueWidth + 2 * linkLabel.fontSize;
        const labelText = (0, text_utils_1.cutToLength)(rawLabelText, maxTextLength);
        const allottedLabelWidth = Math.max(0, rightSide ? rectWidth - diskCenter.x - translateX - widthAdjustment : diskCenter.x + translateX - widthAdjustment);
        const { text, width } = linkLabel.fontSize / 2 <= cy + diskCenter.y && cy + diskCenter.y <= rectHeight - linkLabel.fontSize / 2
            ? (0, text_utils_1.fitText)(measure, labelText, allottedLabelWidth, linkLabel.fontSize, labelFont)
            : { text: '', width: 0 };
        return {
            isRTL,
            linkLabels,
            translate,
            text,
            valueText,
            width,
            valueWidth,
            textAlign: rightSide ? 'left' : 'right',
        };
    };
}
//# sourceMappingURL=link_text_layout.js.map