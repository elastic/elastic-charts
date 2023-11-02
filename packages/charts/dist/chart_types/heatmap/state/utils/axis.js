"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXAxisSize = exports.getTextSizeDimension = exports.getYAxisHorizontalUsedSpace = void 0;
const d3_scale_1 = require("d3-scale");
const math_1 = require("../../../../common/math");
const vectors_1 = require("../../../../common/vectors");
const screenspace_marker_scale_compressor_1 = require("../../../../solvers/screenspace_marker_scale_compressor");
const common_1 = require("../../../../utils/common");
const dimensions_1 = require("../../../../utils/dimensions");
function getYAxisHorizontalUsedSpace(yValues, style, formatter, textMeasure) {
    if (!style.visible) {
        return 0;
    }
    if (typeof style.width === 'number' && (0, common_1.isFiniteNumber)(style.width)) {
        return style.width;
    }
    const longestLabelWidth = yValues.reduce((acc, value) => {
        const { width } = textMeasure(formatter(value), style, style.fontSize);
        return Math.max(width + (0, dimensions_1.horizontalPad)(style.padding), acc);
    }, 0);
    return style.width === 'auto' ? longestLabelWidth : Math.min(longestLabelWidth, style.width.max);
}
exports.getYAxisHorizontalUsedSpace = getYAxisHorizontalUsedSpace;
function getTextSizeDimension(text, style, textMeasure, param, hidden = false) {
    var _a;
    if (!style.visible || text === '' || hidden) {
        return 0;
    }
    const textPadding = (0, dimensions_1.innerPad)(style.padding) + (0, dimensions_1.outerPad)(style.padding);
    if (param === 'height') {
        return style.fontSize + textPadding;
    }
    const textBox = textMeasure(text, {
        fontFamily: style.fontFamily,
        fontVariant: 'normal',
        fontWeight: 'bold',
        fontStyle: (_a = style.fontStyle) !== null && _a !== void 0 ? _a : 'normal',
    }, style.fontSize);
    return textBox.width + textPadding;
}
exports.getTextSizeDimension = getTextSizeDimension;
function getXAxisSize(isCategoricalScale, style, formatter, labels, textMeasure, containerWidth, surroundingSpace) {
    if (!style.visible) {
        return {
            height: 0,
            width: Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
            left: surroundingSpace[0],
            right: surroundingSpace[1],
            tickCadence: NaN,
            minRotation: 0,
        };
    }
    const isRotated = style.rotation !== 0;
    const normalizedScale = (0, d3_scale_1.scaleBand)().domain(labels).range([0, 1]);
    const alignment = isRotated ? 'right' : isCategoricalScale ? 'center' : 'left';
    const alignmentOffset = isCategoricalScale ? normalizedScale.bandwidth() / 2 : 0;
    const scale = (d) => { var _a; return ((_a = normalizedScale(d)) !== null && _a !== void 0 ? _a : 0) + alignmentOffset; };
    const rotationRad = (0, common_1.degToRad)(style.rotation);
    const measuredLabels = labels.map((label) => ({
        ...textMeasure(formatter(label), style, style.fontSize),
        label,
    }));
    if (isCategoricalScale || isRotated) {
        const maxLabelBBox = measuredLabels.reduce((acc, curr) => {
            return {
                height: Math.max(acc.height, curr.height),
                width: Math.max(acc.width, curr.width),
            };
        }, { height: 0, width: 0 });
        const compressedScale = computeCompressedScale(style, scale, measuredLabels, containerWidth, surroundingSpace, alignment, rotationRad);
        const scaleStep = compressedScale.width / labels.length;
        const optimalRotation = scaleStep > maxLabelBBox.width ? 0 : Math.asin(Math.min(maxLabelBBox.height / scaleStep, 1));
        const { width, height, left, right, minRotation } = {
            ...(rotationRad !== 0 && optimalRotation > rotationRad
                ? computeCompressedScale(style, scale, measuredLabels, containerWidth, surroundingSpace, alignment, optimalRotation)
                : compressedScale),
            minRotation: isRotated ? Math.max(optimalRotation, rotationRad) : 0,
        };
        const validCompression = (0, common_1.isFiniteNumber)(width);
        return {
            height: validCompression ? height : 0,
            width: validCompression ? width : Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
            left: validCompression ? left : surroundingSpace[0],
            right: validCompression ? right : surroundingSpace[1],
            tickCadence: validCompression ? 1 : NaN,
            minRotation,
        };
    }
    let tickCadence = 1;
    let dimension = computeCompressedScale(style, scale, measuredLabels, containerWidth, surroundingSpace, alignment, rotationRad);
    for (let i = 1; i < measuredLabels.length; i++) {
        if ((!dimension.overlaps && !dimension.overflow.right) || !(0, common_1.isFiniteNumber)(dimension.width)) {
            break;
        }
        dimension = computeCompressedScale(style, scale, measuredLabels.filter((_, index) => index % (i + 1) === 0), containerWidth, surroundingSpace, alignment, rotationRad);
        tickCadence++;
    }
    if (!(0, common_1.isFiniteNumber)(dimension.width)) {
        return {
            height: 0,
            width: Math.max(containerWidth - surroundingSpace[0] - surroundingSpace[1], 0),
            left: surroundingSpace[0],
            right: surroundingSpace[1],
            tickCadence: NaN,
            minRotation: rotationRad,
        };
    }
    return {
        ...dimension,
        tickCadence,
        minRotation: rotationRad,
    };
}
exports.getXAxisSize = getXAxisSize;
function computeCompressedScale(style, scale, labels, containerWidth, surroundingSpace, alignment, rotation) {
    var _a, _b, _c, _d, _e;
    const { itemsPerSideSize, domainPositions, hMax } = labels.reduce((acc, { width, height, label }) => {
        const labelRect = [
            [0, 0],
            [width, 0],
            [width, height],
            [0, height],
        ];
        const rotationOrigin = alignment === 'right' ? [width, height / 2] : alignment === 'left' ? [0, height / 2] : [width / 2, height / 2];
        const rotatedVectors = labelRect.map((vector) => (0, vectors_1.rotate2)(rotation, (0, vectors_1.sub2)(vector, rotationOrigin)));
        const x = (0, math_1.extent)(rotatedVectors.map((v) => v[0]));
        const y = (0, math_1.extent)(rotatedVectors.map((v) => v[1]));
        acc.wMax = Math.max(acc.wMax, Math.abs(x[1] - x[0]));
        acc.hMax = Math.max(acc.hMax, Math.abs(y[1] - y[0]));
        acc.itemsPerSideSize.push([Math.abs(x[0]), Math.abs(x[1])]);
        const domainPosition = scale(label);
        acc.domainPositions.push(domainPosition);
        return acc;
    }, { wMax: -Infinity, hMax: -Infinity, itemsPerSideSize: [], domainPositions: [] });
    const globalDomainPositions = [0, ...domainPositions, 1];
    const globalItemWidth = [[surroundingSpace[0], 0], ...itemsPerSideSize, [0, surroundingSpace[1]]];
    const { scaleMultiplier, bounds } = (0, screenspace_marker_scale_compressor_1.screenspaceMarkerScaleCompressor)(globalDomainPositions, globalItemWidth, containerWidth);
    const overlaps = itemsPerSideSize.some(([, rightSide], i) => {
        var _a, _b, _c, _d;
        if (i >= itemsPerSideSize.length - 2) {
            return false;
        }
        const currentItemRightSide = ((_a = domainPositions[i]) !== null && _a !== void 0 ? _a : 0) * scaleMultiplier + rightSide + (0, dimensions_1.pad)(style.padding, 'right');
        const nextItemLeftSize = ((_b = domainPositions[i + 1]) !== null && _b !== void 0 ? _b : 0) * scaleMultiplier -
            ((_d = (_c = itemsPerSideSize[i + 1]) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0) -
            (0, dimensions_1.pad)(style.padding, 'left');
        return currentItemRightSide > nextItemLeftSize;
    });
    const leftMargin = (0, common_1.isFiniteNumber)(bounds[0])
        ? ((_b = (_a = globalItemWidth[bounds[0]]) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : 0) - scaleMultiplier * ((_c = globalDomainPositions[bounds[0]]) !== null && _c !== void 0 ? _c : 0)
        : 0;
    const rightMargin = (0, common_1.isFiniteNumber)(bounds[1]) ? (_e = (_d = globalItemWidth[bounds[1]]) === null || _d === void 0 ? void 0 : _d[1]) !== null && _e !== void 0 ? _e : 0 : 0;
    return {
        width: scaleMultiplier,
        right: rightMargin,
        left: leftMargin,
        height: hMax + (0, dimensions_1.pad)(style.padding, 'top') + style.fontSize / 2,
        overlaps,
        overflow: {
            left: bounds[0] !== 0,
            right: bounds[1] !== globalDomainPositions.length - 1,
        },
    };
}
//# sourceMappingURL=axis.js.map