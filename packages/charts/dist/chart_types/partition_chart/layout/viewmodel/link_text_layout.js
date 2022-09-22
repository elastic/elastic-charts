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
exports.linkTextLayout = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var constants_1 = require("../../../../common/constants");
var fill_text_color_1 = require("../../../../common/fill_text_color");
var geometry_1 = require("../../../../common/geometry");
var text_utils_1 = require("../../../../common/text_utils");
var common_1 = require("../../../../utils/common");
var logger_1 = require("../../../../utils/logger");
function linkTextLayout(rectWidth, rectHeight, measure, style, nodesWithoutRoom, currentY, anchorRadius, rawTextGetter, valueGetter, valueFormatter, maxTextLength, diskCenter, _a) {
    var backgroundColor = _a.color, fallbackBGColor = _a.fallbackColor;
    var linkLabel = style.linkLabel;
    var maxDepth = nodesWithoutRoom.reduce(function (p, n) { return Math.max(p, n.depth); }, 0);
    var yRelativeIncrement = Math.sin(linkLabel.stemAngle) * linkLabel.minimumStemLength;
    var rowPitch = linkLabel.fontSize + linkLabel.spacing;
    var linkLabels = nodesWithoutRoom
        .filter(function (n) { return n.depth === maxDepth; })
        .sort(function (n1, n2) { return Math.abs(n2.x0 - n2.x1) - Math.abs(n1.x0 - n1.x1); })
        .slice(0, linkLabel.maxCount)
        .sort(linkLabelCompare)
        .map(nodeToLinkLabel({
        linkLabel: linkLabel,
        anchorRadius: anchorRadius,
        currentY: currentY,
        rowPitch: rowPitch,
        yRelativeIncrement: yRelativeIncrement,
        rawTextGetter: rawTextGetter,
        maxTextLength: maxTextLength,
        valueFormatter: valueFormatter,
        valueGetter: valueGetter,
        measure: measure,
        rectWidth: rectWidth,
        rectHeight: rectHeight,
        diskCenter: diskCenter,
    }))
        .filter(function (_a) {
        var text = _a.text;
        return text !== '';
    });
    if ((0, color_library_wrappers_1.colorToRgba)(backgroundColor)[3] < 1) {
        logger_1.Logger.expected('Text contrast requires an opaque background color, using fallbackColor', 'an opaque color', backgroundColor);
    }
    var textColor = linkLabel.textColor === common_1.ColorVariant.Adaptive
        ? (0, fill_text_color_1.fillTextColor)(fallbackBGColor, null, backgroundColor)
        : linkLabel.textColor;
    var labelFontSpec = __assign(__assign({}, linkLabel), { textColor: textColor });
    var valueFontSpec = __assign(__assign(__assign({}, linkLabel), linkLabel.valueFont), { textColor: textColor });
    return { linkLabels: linkLabels, valueFontSpec: valueFontSpec, labelFontSpec: labelFontSpec, strokeColor: textColor };
}
exports.linkTextLayout = linkTextLayout;
function linkLabelCompare(n1, n2) {
    var mid1 = (0, geometry_1.meanAngle)(n1.x0, n1.x1);
    var mid2 = (0, geometry_1.meanAngle)(n2.x0, n2.x1);
    var dist1 = Math.min(Math.abs(mid1 - constants_1.TAU / 4), Math.abs(mid1 - (3 * constants_1.TAU) / 4));
    var dist2 = Math.min(Math.abs(mid2 - constants_1.TAU / 4), Math.abs(mid2 - (3 * constants_1.TAU) / 4));
    return dist1 - dist2;
}
function nodeToLinkLabel(_a) {
    var linkLabel = _a.linkLabel, anchorRadius = _a.anchorRadius, currentY = _a.currentY, rowPitch = _a.rowPitch, yRelativeIncrement = _a.yRelativeIncrement, rawTextGetter = _a.rawTextGetter, maxTextLength = _a.maxTextLength, valueFormatter = _a.valueFormatter, valueGetter = _a.valueGetter, measure = _a.measure, rectWidth = _a.rectWidth, rectHeight = _a.rectHeight, diskCenter = _a.diskCenter;
    var labelFont = linkLabel;
    var valueFont = __assign(__assign({}, labelFont), linkLabel.valueFont);
    return function nodeToLinkLabelMap(node) {
        var midAngle = (0, geometry_1.trueBearingToStandardPositionAngle)((node.x0 + node.x1) / 2);
        var north = midAngle < constants_1.TAU / 2 ? 1 : -1;
        var rightSide = constants_1.TAU / 4 < midAngle && midAngle < (3 * constants_1.TAU) / 4 ? 0 : 1;
        var west = rightSide ? 1 : -1;
        var cos = Math.cos(midAngle);
        var sin = Math.sin(midAngle);
        var x0 = cos * anchorRadius;
        var y0 = sin * anchorRadius;
        var x = cos * (anchorRadius + linkLabel.radiusPadding);
        var y = sin * (anchorRadius + linkLabel.radiusPadding);
        var stemFromX = x;
        var stemFromY = y;
        var poolIndex = rightSide + (1 - north);
        var relativeY = north * y;
        var yOffset = Math.max(currentY[poolIndex] + rowPitch, relativeY + yRelativeIncrement, rowPitch / 2);
        currentY[poolIndex] = yOffset;
        var cy = north * yOffset;
        var stemToX = x + north * west * cy - west * relativeY;
        var stemToY = cy;
        var translateX = stemToX + west * (linkLabel.horizontalStemLength + linkLabel.gap);
        var translate = [translateX, stemToY];
        var linkLabels = [
            [x0, y0],
            [stemFromX, stemFromY],
            [stemToX, stemToY],
            [stemToX + west * linkLabel.horizontalStemLength, stemToY],
        ];
        var rawLabelText = rawTextGetter(node);
        var isRTL = (0, common_1.isRTLString)(rawLabelText);
        var valueText = valueFormatter(valueGetter(node));
        var valueWidth = (0, text_utils_1.measureOneBoxWidth)(measure, linkLabel.fontSize, __assign(__assign({}, valueFont), { text: valueText, isValue: false }));
        var widthAdjustment = valueWidth + 2 * linkLabel.fontSize;
        var labelText = (0, text_utils_1.cutToLength)(rawLabelText, maxTextLength);
        var allottedLabelWidth = Math.max(0, rightSide ? rectWidth - diskCenter.x - translateX - widthAdjustment : diskCenter.x + translateX - widthAdjustment);
        var _a = linkLabel.fontSize / 2 <= cy + diskCenter.y && cy + diskCenter.y <= rectHeight - linkLabel.fontSize / 2
            ? (0, text_utils_1.fitText)(measure, labelText, allottedLabelWidth, linkLabel.fontSize, labelFont)
            : { text: '', width: 0 }, text = _a.text, width = _a.width;
        return {
            isRTL: isRTL,
            linkLabels: linkLabels,
            translate: translate,
            text: text,
            valueText: valueText,
            width: width,
            valueWidth: valueWidth,
            textAlign: rightSide ? 'left' : 'right',
        };
    };
}
//# sourceMappingURL=link_text_layout.js.map