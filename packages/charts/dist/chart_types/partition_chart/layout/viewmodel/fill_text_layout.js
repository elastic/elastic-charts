"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fillTextLayout = exports.inSectorRotation = exports.getRectangleRowGeometry = exports.getSectorRowGeometry = exports.nodeId = void 0;
const constants_1 = require("../../../../common/constants");
const geometry_1 = require("../../../../common/geometry");
const math_1 = require("../../../../common/math");
const text_utils_1 = require("../../../../common/text_utils");
const monotonic_hill_climb_1 = require("../../../../solvers/monotonic_hill_climb");
const common_1 = require("../../../../utils/common");
const circline_geometry_1 = require("../utils/circline_geometry");
function nodeId(node) {
    return `${node.x0}|${node.y0}`;
}
exports.nodeId = nodeId;
const getSectorRowGeometry = (ringSector, cx, cy, totalRowCount, linePitch, rowIndex, fontSize, rotation) => {
    const offset = (totalRowCount / 2) * fontSize + fontSize / 2 - linePitch * rowIndex;
    const topCircline = (0, circline_geometry_1.makeRowCircline)(cx, cy, offset, rotation, fontSize, 1);
    const bottomCircline = (0, circline_geometry_1.makeRowCircline)(cx, cy, offset, rotation, fontSize, -1);
    const midCircline = (0, circline_geometry_1.makeRowCircline)(cx, cy, offset, rotation, 0, 0);
    const valid1 = (0, circline_geometry_1.conjunctiveConstraint)(ringSector, { ...topCircline, from: 0, to: constants_1.TAU })[0];
    if (!valid1)
        return { rowAnchorX: cx, rowAnchorY: cy, maximumRowLength: 0 };
    const valid2 = (0, circline_geometry_1.conjunctiveConstraint)(ringSector, { ...bottomCircline, from: 0, to: constants_1.TAU })[0];
    if (!valid2)
        return { rowAnchorX: cx, rowAnchorY: cy, maximumRowLength: 0 };
    const from = Math.max(valid1.from, valid2.from);
    const to = Math.min(valid1.to, valid2.to);
    const midAngle = (from + to) / 2;
    const cheapTangent = Math.max(0, to - from);
    const rowAnchorX = midCircline.r * Math.cos(midAngle) + midCircline.x;
    const rowAnchorY = midCircline.r * Math.sin(midAngle) + midCircline.y;
    const maximumRowLength = cheapTangent * circline_geometry_1.INFINITY_RADIUS;
    return { rowAnchorX, rowAnchorY, maximumRowLength };
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
const getRectangleRowGeometry = (container, cx, cy, totalRowCount, linePitch, rowIndex, fontSize, _rotation, verticalAlignment, padding) => {
    const defaultPad = 2;
    const { top, right, bottom, left } = typeof padding === 'number'
        ? { top: padding, right: padding, bottom: padding, left: padding }
        : {
            top: defaultPad,
            right: defaultPad,
            bottom: defaultPad,
            left: defaultPad,
            ...padding,
        };
    const overhang = 0.05;
    const topPaddingAdjustment = fontSize < 6 ? 0 : Math.max(1, Math.min(2, fontSize / 16));
    const adjustedTop = top + topPaddingAdjustment;
    if ((container.y1 - container.y0 - adjustedTop - bottom) / totalRowCount < linePitch) {
        return {
            rowAnchorX: NaN,
            rowAnchorY: NaN,
            maximumRowLength: 0,
        };
    }
    const rowAnchorY = getVerticalAlignment(container, verticalAlignment, linePitch, totalRowCount, rowIndex, adjustedTop, bottom, fontSize, overhang);
    return {
        rowAnchorX: cx + left / 2 - right / 2,
        rowAnchorY,
        maximumRowLength: container.x1 - container.x0 - left - right,
    };
};
exports.getRectangleRowGeometry = getRectangleRowGeometry;
function rowSetComplete(rowSet, measuredBoxes) {
    return (measuredBoxes.length === 0 &&
        !rowSet.rows.some((r) => !Number.isFinite(r.length) || r.rowWords.every((rw) => rw.text.length === 0)));
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
        .map((text) => ({ text, ...sizeInvariantFontShorthand, isValue: false }))
        .concat([valueFormatter(valueGetter(node))]
        .filter(Boolean)
        .map((text) => ({ text, ...sizeInvariantFontShorthand, ...valueFont, isValue: true })));
}
function getWordSpacing(fontSize) {
    return fontSize / 4;
}
function fill(shapeConstructor, getShapeRowGeometry, getRotation) {
    return function fillClosure(fillLabel, layers, measure, rawTextGetter, valueGetter, formatter, maxRowCount, leftAlign, middleAlign) {
        const horizontalAlignment = leftAlign ? text_utils_1.HorizontalAlignment.left : text_utils_1.HorizontalAlignment.center;
        return (allFontSizes, textFillOrigin, node) => {
            var _a, _b;
            const container = shapeConstructor(node);
            const rotation = getRotation(node);
            const layer = layers[node.depth - 1];
            if (!layer) {
                throw new Error(`Failed to find layer at ${node.depth - 1}`);
            }
            const verticalAlignment = middleAlign
                ? text_utils_1.VerticalAlignments.middle
                : node.depth < layers.length
                    ? text_utils_1.VerticalAlignments.bottom
                    : text_utils_1.VerticalAlignments.top;
            const fontSizes = (_a = allFontSizes[Math.min(node.depth, allFontSizes.length) - 1]) !== null && _a !== void 0 ? _a : [];
            const { fontStyle, fontVariant, fontFamily, fontWeight, valueFormatter, padding, clipText } = {
                ...fillLabel,
                valueFormatter: formatter,
                ...layer.fillLabel,
                ...layer.shape,
            };
            const valueFont = {
                ...fillLabel,
                ...fillLabel.valueFont,
                ...layer.fillLabel,
                ...(_b = layer.fillLabel) === null || _b === void 0 ? void 0 : _b.valueFont,
            };
            const sizeInvariantFont = {
                fontStyle,
                fontVariant,
                fontWeight,
                fontFamily,
                textColor: node.textColor,
            };
            const isRtlString = (0, common_1.isRTLString)(rawTextGetter(node));
            const allBoxes = getAllBoxes(rawTextGetter, valueGetter, valueFormatter, sizeInvariantFont, valueFont, node);
            const [cx, cy] = textFillOrigin;
            return {
                ...getRowSet(allBoxes, maxRowCount, fontSizes, measure, rotation, verticalAlignment, horizontalAlignment, container, getShapeRowGeometry, cx, cy, padding, node, clipText, isRtlString),
                fillTextColor: node.textColor,
            };
        };
    };
}
function tryFontSize(measure, rotation, verticalAlignment, horizontalAlignment, container, getShapeRowGeometry, cx, cy, padding, node, boxes, maxRowCount, clipText, isRTL) {
    const adjustedHorizontalAlignment = isRTL ? (0, common_1.getOppositeAlignment)(horizontalAlignment) : horizontalAlignment;
    return function tryFontSizeFn(initialRowSet, fontSize) {
        let rowSet = initialRowSet;
        const wordSpacing = getWordSpacing(fontSize);
        const allMeasuredBoxes = boxes.map((box) => {
            const { width } = measure(box.text, box, fontSize);
            return {
                width,
                wordBeginning: NaN,
                ...box,
                fontSize,
            };
        });
        const linePitch = fontSize;
        let targetRowCount = 0;
        let measuredBoxes = allMeasuredBoxes.slice();
        let innerCompleted = false;
        while (++targetRowCount <= maxRowCount && !innerCompleted) {
            measuredBoxes = allMeasuredBoxes.slice();
            rowSet = {
                id: nodeId(node),
                fontSize,
                fillTextColor: '',
                rotation,
                verticalAlignment,
                horizontalAlignment: adjustedHorizontalAlignment,
                clipText,
                isRTL,
                rows: [...new Array(targetRowCount)].map(() => ({
                    rowWords: [],
                    rowAnchorX: NaN,
                    rowAnchorY: NaN,
                    maximumLength: NaN,
                    length: NaN,
                })),
                container,
            };
            let currentRowIndex = 0;
            while (currentRowIndex < targetRowCount) {
                const currentRow = rowSet.rows[currentRowIndex];
                if (!currentRow) {
                    currentRowIndex++;
                    continue;
                }
                const currentRowWords = currentRow.rowWords;
                const { maximumRowLength, rowAnchorX, rowAnchorY } = getShapeRowGeometry(container, cx, cy, targetRowCount, linePitch, currentRowIndex, fontSize, rotation, verticalAlignment, padding);
                currentRow.rowAnchorX = rowAnchorX;
                currentRow.rowAnchorY = rowAnchorY;
                currentRow.maximumLength = maximumRowLength;
                let currentRowLength = 0;
                let rowHasRoom = true;
                while (measuredBoxes.length > 0 && rowHasRoom) {
                    const [currentBox] = measuredBoxes;
                    if (!currentBox)
                        continue;
                    const wordBeginning = currentRowLength;
                    currentRowLength += currentBox.width + wordSpacing;
                    if (clipText || currentRowLength <= currentRow.maximumLength) {
                        currentRowWords.push({ ...currentBox, wordBeginning });
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
        const completed = measuredBoxes.length === 0;
        return { rowSet, completed };
    };
}
function getRowSet(boxes, maxRowCount, fontSizes, measure, rotation, verticalAlignment, horizontalAlignment, container, getShapeRowGeometry, cx, cy, padding, node, clipText, isRtl) {
    var _a;
    const tryFunction = tryFontSize(measure, rotation, verticalAlignment, horizontalAlignment, container, getShapeRowGeometry, cx, cy, padding, node, boxes, maxRowCount, clipText, isRtl);
    const largestIndex = fontSizes.length - 1;
    const response = (i) => { var _a; return i + (tryFunction(identityRowSet(), (_a = fontSizes[i]) !== null && _a !== void 0 ? _a : 0).completed ? 0 : largestIndex + 1); };
    const fontSizeIndex = (0, monotonic_hill_climb_1.monotonicHillClimb)(response, largestIndex, largestIndex, monotonic_hill_climb_1.integerSnap);
    if (!(fontSizeIndex >= 0)) {
        return identityRowSet();
    }
    const { rowSet, completed } = tryFunction(identityRowSet(), (_a = fontSizes[fontSizeIndex]) !== null && _a !== void 0 ? _a : 0);
    return { ...rowSet, rows: rowSet.rows.filter((r) => completed && Number.isFinite(r.length)) };
}
function inSectorRotation(horizontalTextEnforcer, horizontalTextAngleThreshold) {
    return (node) => {
        let rotation = (0, geometry_1.trueBearingToStandardPositionAngle)((node.x0 + node.x1) / 2);
        if (Math.abs(node.x1 - node.x0) > horizontalTextAngleThreshold && horizontalTextEnforcer > 0)
            rotation *= 1 - horizontalTextEnforcer;
        if (constants_1.TAU / 4 < rotation && rotation < (3 * constants_1.TAU) / 4)
            rotation = (0, geometry_1.wrapToTau)(rotation - constants_1.TAU / 2);
        return rotation;
    };
}
exports.inSectorRotation = inSectorRotation;
function fillTextLayout(shapeConstructor, getShapeRowGeometry, getRotation) {
    const specificFiller = fill(shapeConstructor, getShapeRowGeometry, getRotation);
    return function fillTextLayoutClosure(measure, rawTextGetter, valueGetter, valueFormatter, childNodes, style, layers, textFillOrigins, maxRowCount, leftAlign, middleAlign) {
        var _a;
        const allFontSizes = [];
        for (let l = 0; l <= layers.length; l++) {
            const { minFontSize, maxFontSize, idealFontSizeJump } = {
                ...style,
                ...(l < layers.length && ((_a = layers[l]) === null || _a === void 0 ? void 0 : _a.fillLabel)),
            };
            const fontSizeMagnification = maxFontSize / minFontSize;
            const fontSizeJumpCount = Math.round((0, math_1.logarithm)(idealFontSizeJump, fontSizeMagnification));
            const realFontSizeJump = Math.pow(fontSizeMagnification, 1 / fontSizeJumpCount);
            const fontSizes = [];
            for (let i = 0; i <= fontSizeJumpCount; i++) {
                const fontSize = Math.round(minFontSize * Math.pow(realFontSizeJump, i));
                if (!fontSizes.includes(fontSize)) {
                    fontSizes.push(fontSize);
                }
            }
            allFontSizes.push(fontSizes);
        }
        const filler = specificFiller(style.fillLabel, layers, measure, rawTextGetter, valueGetter, valueFormatter, maxRowCount, leftAlign, middleAlign);
        return childNodes
            .map((node, i) => ({ node, origin: textFillOrigins[i] }))
            .sort((a, b) => b.node.value - a.node.value)
            .reduce(({ rowSets, fontSizes }, { node, origin }) => {
            if (!origin)
                return { rowSets, fontSizes };
            const nextRowSet = filler(fontSizes, origin, node);
            const { fontSize } = nextRowSet;
            const layerIndex = node.depth - 1;
            return {
                rowSets: [...rowSets, nextRowSet],
                fontSizes: fontSizes.map((layerFontSizes, index) => {
                    var _a, _b;
                    return Number.isFinite(fontSize) && index === layerIndex && !((_b = (_a = layers[layerIndex]) === null || _a === void 0 ? void 0 : _a.fillLabel) === null || _b === void 0 ? void 0 : _b.maximizeFontSize)
                        ? layerFontSizes.filter((size) => size <= fontSize)
                        : layerFontSizes;
                }),
            };
        }, { rowSets: [], fontSizes: allFontSizes }).rowSets;
    };
}
exports.fillTextLayout = fillTextLayout;
//# sourceMappingURL=fill_text_layout.js.map