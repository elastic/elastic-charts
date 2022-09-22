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
exports.fillTextLayout = exports.inSectorRotation = exports.getRectangleRowGeometry = exports.getSectorRowGeometry = exports.nodeId = void 0;
var constants_1 = require("../../../../common/constants");
var geometry_1 = require("../../../../common/geometry");
var math_1 = require("../../../../common/math");
var text_utils_1 = require("../../../../common/text_utils");
var monotonic_hill_climb_1 = require("../../../../solvers/monotonic_hill_climb");
var common_1 = require("../../../../utils/common");
var circline_geometry_1 = require("../utils/circline_geometry");
function nodeId(node) {
    return "".concat(node.x0, "|").concat(node.y0);
}
exports.nodeId = nodeId;
var getSectorRowGeometry = function (ringSector, cx, cy, totalRowCount, linePitch, rowIndex, fontSize, rotation) {
    var offset = (totalRowCount / 2) * fontSize + fontSize / 2 - linePitch * rowIndex;
    var topCircline = (0, circline_geometry_1.makeRowCircline)(cx, cy, offset, rotation, fontSize, 1);
    var bottomCircline = (0, circline_geometry_1.makeRowCircline)(cx, cy, offset, rotation, fontSize, -1);
    var midCircline = (0, circline_geometry_1.makeRowCircline)(cx, cy, offset, rotation, 0, 0);
    var valid1 = (0, circline_geometry_1.conjunctiveConstraint)(ringSector, __assign(__assign({}, topCircline), { from: 0, to: constants_1.TAU }))[0];
    if (!valid1)
        return { rowAnchorX: cx, rowAnchorY: cy, maximumRowLength: 0 };
    var valid2 = (0, circline_geometry_1.conjunctiveConstraint)(ringSector, __assign(__assign({}, bottomCircline), { from: 0, to: constants_1.TAU }))[0];
    if (!valid2)
        return { rowAnchorX: cx, rowAnchorY: cy, maximumRowLength: 0 };
    var from = Math.max(valid1.from, valid2.from);
    var to = Math.min(valid1.to, valid2.to);
    var midAngle = (from + to) / 2;
    var cheapTangent = Math.max(0, to - from);
    var rowAnchorX = midCircline.r * Math.cos(midAngle) + midCircline.x;
    var rowAnchorY = midCircline.r * Math.sin(midAngle) + midCircline.y;
    var maximumRowLength = cheapTangent * circline_geometry_1.INFINITY_RADIUS;
    return { rowAnchorX: rowAnchorX, rowAnchorY: rowAnchorY, maximumRowLength: maximumRowLength };
};
exports.getSectorRowGeometry = getSectorRowGeometry;
function getVerticalAlignment(container, verticalAlignment, linePitch, totalRowCount, rowIndex, paddingTop, paddingBottom, fontSize, overhang) {
    switch (verticalAlignment) {
        case text_utils_1.VerticalAlignments.top:
            return -(container.y0 + linePitch * rowIndex + paddingTop + fontSize * overhang);
        case text_utils_1.VerticalAlignments.bottom:
            return -(container.y1 - linePitch * (totalRowCount - 1 - rowIndex) - paddingBottom - fontSize * overhang);
        default:
            return -((container.y0 + container.y1) / 2 + (linePitch * (rowIndex + 1 - totalRowCount)) / 2);
    }
}
var getRectangleRowGeometry = function (container, cx, cy, totalRowCount, linePitch, rowIndex, fontSize, _rotation, verticalAlignment, padding) {
    var defaultPad = 2;
    var _a = typeof padding === 'number'
        ? { top: padding, right: padding, bottom: padding, left: padding }
        : __assign({ top: defaultPad, right: defaultPad, bottom: defaultPad, left: defaultPad }, padding), top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left;
    var overhang = 0.05;
    var topPaddingAdjustment = fontSize < 6 ? 0 : Math.max(1, Math.min(2, fontSize / 16));
    var adjustedTop = top + topPaddingAdjustment;
    if ((container.y1 - container.y0 - adjustedTop - bottom) / totalRowCount < linePitch) {
        return {
            rowAnchorX: NaN,
            rowAnchorY: NaN,
            maximumRowLength: 0,
        };
    }
    var rowAnchorY = getVerticalAlignment(container, verticalAlignment, linePitch, totalRowCount, rowIndex, adjustedTop, bottom, fontSize, overhang);
    return {
        rowAnchorX: cx + left / 2 - right / 2,
        rowAnchorY: rowAnchorY,
        maximumRowLength: container.x1 - container.x0 - left - right,
    };
};
exports.getRectangleRowGeometry = getRectangleRowGeometry;
function rowSetComplete(rowSet, measuredBoxes) {
    return (measuredBoxes.length === 0 &&
        !rowSet.rows.some(function (r) { return !Number.isFinite(r.length) || r.rowWords.every(function (rw) { return rw.text.length === 0; }); }));
}
function identityRowSet() {
    return {
        id: '',
        rows: [],
        fontSize: NaN,
        fillTextColor: '',
        rotation: NaN,
        isRTL: false,
        verticalAlignment: text_utils_1.VerticalAlignments.middle,
        horizontalAlignment: text_utils_1.HorizontalAlignment.center,
    };
}
function getAllBoxes(rawTextGetter, valueGetter, valueFormatter, sizeInvariantFontShorthand, valueFont, node) {
    return rawTextGetter(node)
        .split(' ')
        .filter(Boolean)
        .map(function (text) { return (__assign(__assign({ text: text }, sizeInvariantFontShorthand), { isValue: false })); })
        .concat([valueFormatter(valueGetter(node))]
        .filter(Boolean)
        .map(function (text) { return (__assign(__assign(__assign({ text: text }, sizeInvariantFontShorthand), valueFont), { isValue: true })); }));
}
function getWordSpacing(fontSize) {
    return fontSize / 4;
}
function fill(shapeConstructor, getShapeRowGeometry, getRotation) {
    return function fillClosure(fillLabel, layers, measure, rawTextGetter, valueGetter, formatter, maxRowCount, leftAlign, middleAlign) {
        var horizontalAlignment = leftAlign ? text_utils_1.HorizontalAlignment.left : text_utils_1.HorizontalAlignment.center;
        return function (allFontSizes, textFillOrigin, node) {
            var _a;
            var container = shapeConstructor(node);
            var rotation = getRotation(node);
            var layer = layers[node.depth - 1] || {};
            var verticalAlignment = middleAlign
                ? text_utils_1.VerticalAlignments.middle
                : node.depth < layers.length
                    ? text_utils_1.VerticalAlignments.bottom
                    : text_utils_1.VerticalAlignments.top;
            var fontSizes = allFontSizes[Math.min(node.depth, allFontSizes.length) - 1];
            var _b = __assign(__assign(__assign(__assign({}, fillLabel), { valueFormatter: formatter }), layer.fillLabel), layer.shape), fontStyle = _b.fontStyle, fontVariant = _b.fontVariant, fontFamily = _b.fontFamily, fontWeight = _b.fontWeight, valueFormatter = _b.valueFormatter, padding = _b.padding, clipText = _b.clipText;
            var valueFont = __assign(__assign(__assign(__assign({}, fillLabel), fillLabel.valueFont), layer.fillLabel), (_a = layer.fillLabel) === null || _a === void 0 ? void 0 : _a.valueFont);
            var sizeInvariantFont = {
                fontStyle: fontStyle,
                fontVariant: fontVariant,
                fontWeight: fontWeight,
                fontFamily: fontFamily,
                textColor: node.textColor,
            };
            var isRtlString = (0, common_1.isRTLString)(rawTextGetter(node));
            var allBoxes = getAllBoxes(rawTextGetter, valueGetter, valueFormatter, sizeInvariantFont, valueFont, node);
            var _c = __read(textFillOrigin, 2), cx = _c[0], cy = _c[1];
            return __assign(__assign({}, getRowSet(allBoxes, maxRowCount, fontSizes, measure, rotation, verticalAlignment, horizontalAlignment, container, getShapeRowGeometry, cx, cy, padding, node, clipText, isRtlString)), { fillTextColor: node.textColor });
        };
    };
}
function tryFontSize(measure, rotation, verticalAlignment, horizontalAlignment, container, getShapeRowGeometry, cx, cy, padding, node, boxes, maxRowCount, clipText, isRTL) {
    var adjustedHorizontalAlignment = isRTL ? (0, common_1.getOppositeAlignment)(horizontalAlignment) : horizontalAlignment;
    return function tryFontSizeFn(initialRowSet, fontSize) {
        var rowSet = initialRowSet;
        var wordSpacing = getWordSpacing(fontSize);
        var allMeasuredBoxes = boxes.map(function (box) {
            var width = measure(box.text, box, fontSize).width;
            return __assign(__assign({ width: width, wordBeginning: NaN }, box), { fontSize: fontSize });
        });
        var linePitch = fontSize;
        var targetRowCount = 0;
        var measuredBoxes = allMeasuredBoxes.slice();
        var innerCompleted = false;
        while (++targetRowCount <= maxRowCount && !innerCompleted) {
            measuredBoxes = allMeasuredBoxes.slice();
            rowSet = {
                id: nodeId(node),
                fontSize: fontSize,
                fillTextColor: '',
                rotation: rotation,
                verticalAlignment: verticalAlignment,
                horizontalAlignment: adjustedHorizontalAlignment,
                clipText: clipText,
                isRTL: isRTL,
                rows: __spreadArray([], __read(new Array(targetRowCount)), false).map(function () { return ({
                    rowWords: [],
                    rowAnchorX: NaN,
                    rowAnchorY: NaN,
                    maximumLength: NaN,
                    length: NaN,
                }); }),
                container: container,
            };
            var currentRowIndex = 0;
            while (currentRowIndex < targetRowCount) {
                var currentRow = rowSet.rows[currentRowIndex];
                var currentRowWords = currentRow.rowWords;
                var _a = getShapeRowGeometry(container, cx, cy, targetRowCount, linePitch, currentRowIndex, fontSize, rotation, verticalAlignment, padding), maximumRowLength = _a.maximumRowLength, rowAnchorX = _a.rowAnchorX, rowAnchorY = _a.rowAnchorY;
                currentRow.rowAnchorX = rowAnchorX;
                currentRow.rowAnchorY = rowAnchorY;
                currentRow.maximumLength = maximumRowLength;
                var currentRowLength = 0;
                var rowHasRoom = true;
                while (measuredBoxes.length > 0 && rowHasRoom) {
                    var _b = __read(measuredBoxes, 1), currentBox = _b[0];
                    var wordBeginning = currentRowLength;
                    currentRowLength += currentBox.width + wordSpacing;
                    if (clipText || currentRowLength <= currentRow.maximumLength) {
                        currentRowWords.push(__assign(__assign({}, currentBox), { wordBeginning: wordBeginning }));
                        currentRow.length = currentRowLength;
                        measuredBoxes.shift();
                    }
                    else {
                        rowHasRoom = false;
                    }
                }
                currentRowIndex++;
            }
            innerCompleted = rowSetComplete(rowSet, measuredBoxes);
        }
        var completed = measuredBoxes.length === 0;
        return { rowSet: rowSet, completed: completed };
    };
}
function getRowSet(boxes, maxRowCount, fontSizes, measure, rotation, verticalAlignment, horizontalAlignment, container, getShapeRowGeometry, cx, cy, padding, node, clipText, isRtl) {
    var tryFunction = tryFontSize(measure, rotation, verticalAlignment, horizontalAlignment, container, getShapeRowGeometry, cx, cy, padding, node, boxes, maxRowCount, clipText, isRtl);
    var largestIndex = fontSizes.length - 1;
    var response = function (i) { return i + (tryFunction(identityRowSet(), fontSizes[i]).completed ? 0 : largestIndex + 1); };
    var fontSizeIndex = (0, monotonic_hill_climb_1.monotonicHillClimb)(response, largestIndex, largestIndex, monotonic_hill_climb_1.integerSnap);
    if (!(fontSizeIndex >= 0)) {
        return identityRowSet();
    }
    var _a = tryFunction(identityRowSet(), fontSizes[fontSizeIndex]), rowSet = _a.rowSet, completed = _a.completed;
    return __assign(__assign({}, rowSet), { rows: rowSet.rows.filter(function (r) { return completed && Number.isFinite(r.length); }) });
}
function inSectorRotation(horizontalTextEnforcer, horizontalTextAngleThreshold) {
    return function (node) {
        var rotation = (0, geometry_1.trueBearingToStandardPositionAngle)((node.x0 + node.x1) / 2);
        if (Math.abs(node.x1 - node.x0) > horizontalTextAngleThreshold && horizontalTextEnforcer > 0)
            rotation *= 1 - horizontalTextEnforcer;
        if (constants_1.TAU / 4 < rotation && rotation < (3 * constants_1.TAU) / 4)
            rotation = (0, geometry_1.wrapToTau)(rotation - constants_1.TAU / 2);
        return rotation;
    };
}
exports.inSectorRotation = inSectorRotation;
function fillTextLayout(shapeConstructor, getShapeRowGeometry, getRotation) {
    var specificFiller = fill(shapeConstructor, getShapeRowGeometry, getRotation);
    return function fillTextLayoutClosure(measure, rawTextGetter, valueGetter, valueFormatter, childNodes, style, layers, textFillOrigins, maxRowCount, leftAlign, middleAlign) {
        var allFontSizes = [];
        for (var l = 0; l <= layers.length; l++) {
            var _a = __assign(__assign({}, style), (l < layers.length && layers[l].fillLabel)), minFontSize = _a.minFontSize, maxFontSize = _a.maxFontSize, idealFontSizeJump = _a.idealFontSizeJump;
            var fontSizeMagnification = maxFontSize / minFontSize;
            var fontSizeJumpCount = Math.round((0, math_1.logarithm)(idealFontSizeJump, fontSizeMagnification));
            var realFontSizeJump = Math.pow(fontSizeMagnification, 1 / fontSizeJumpCount);
            var fontSizes = [];
            for (var i = 0; i <= fontSizeJumpCount; i++) {
                var fontSize = Math.round(minFontSize * Math.pow(realFontSizeJump, i));
                if (!fontSizes.includes(fontSize)) {
                    fontSizes.push(fontSize);
                }
            }
            allFontSizes.push(fontSizes);
        }
        var filler = specificFiller(style.fillLabel, layers, measure, rawTextGetter, valueGetter, valueFormatter, maxRowCount, leftAlign, middleAlign);
        return childNodes
            .map(function (node, i) { return ({ node: node, origin: textFillOrigins[i] }); })
            .sort(function (a, b) { return b.node.value - a.node.value; })
            .reduce(function (_a, _b) {
            var rowSets = _a.rowSets, fontSizes = _a.fontSizes;
            var node = _b.node, origin = _b.origin;
            var nextRowSet = filler(fontSizes, origin, node);
            var fontSize = nextRowSet.fontSize;
            var layerIndex = node.depth - 1;
            return {
                rowSets: __spreadArray(__spreadArray([], __read(rowSets), false), [nextRowSet], false),
                fontSizes: fontSizes.map(function (layerFontSizes, index) {
                    var _a, _b;
                    return Number.isFinite(fontSize) && index === layerIndex && !((_b = (_a = layers[layerIndex]) === null || _a === void 0 ? void 0 : _a.fillLabel) === null || _b === void 0 ? void 0 : _b.maximizeFontSize)
                        ? layerFontSizes.filter(function (size) { return size <= fontSize; })
                        : layerFontSizes;
                }),
            };
        }, { rowSets: [], fontSizes: allFontSizes }).rowSets;
    };
}
exports.fillTextLayout = fillTextLayout;
//# sourceMappingURL=fill_text_layout.js.map