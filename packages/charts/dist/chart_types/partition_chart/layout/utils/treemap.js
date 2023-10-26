"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treemap = exports.getTopPadding = exports.LayerLayout = exports.leastSquarishAspectRatio = void 0;
const group_by_rollup_1 = require("./group_by_rollup");
const constants_1 = require("../../../../common/constants");
const MAX_U_PADDING_RATIO = 0.0256197;
const MAX_TOP_PADDING_RATIO = 0.33;
function layVector(nodes, independentSize, areaAccessor, rescaleAreaFactor = 1) {
    const area = nodes.reduce((p, n) => p + areaAccessor(n) * rescaleAreaFactor, 0);
    const dependentSize = area / independentSize;
    let currentOffset = 0;
    const sectionOffsets = [currentOffset];
    const sectionSizes = nodes.map((e, i) => {
        const sectionSize = (rescaleAreaFactor * areaAccessor(e)) / dependentSize;
        if (i < nodes.length - 1)
            sectionOffsets.push((currentOffset += sectionSize));
        return sectionSize;
    });
    return { nodes, dependentSize, sectionSizes, sectionOffsets };
}
function leastSquarishAspectRatio({ sectionSizes, dependentSize }) {
    if (dependentSize === 0) {
        return 1;
    }
    return sectionSizes.reduce((p, n) => Math.min(p, n / dependentSize, dependentSize / n), 1);
}
exports.leastSquarishAspectRatio = leastSquarishAspectRatio;
const NullLayoutElement = {
    nodes: [],
    dependentSize: NaN,
    sectionSizes: [],
    sectionOffsets: [],
};
exports.LayerLayout = Object.freeze({
    horizontal: 'horizontal',
    vertical: 'vertical',
    squarifying: 'squarifying',
});
function bestVector(nodes, height, areaAccessor, layout, rescaleAreaFactor = 1) {
    let previousWorstAspectRatio = -1;
    let currentWorstAspectRatio = 0;
    let previousVectorLayout = NullLayoutElement;
    let currentVectorLayout = NullLayoutElement;
    let currentCount = 1;
    do {
        previousVectorLayout = currentVectorLayout;
        previousWorstAspectRatio = currentWorstAspectRatio;
        currentVectorLayout = layVector(nodes.slice(0, currentCount), height, areaAccessor, rescaleAreaFactor);
        currentWorstAspectRatio = leastSquarishAspectRatio(currentVectorLayout);
    } while (currentCount++ < nodes.length && (layout || currentWorstAspectRatio > previousWorstAspectRatio));
    return layout || currentWorstAspectRatio >= previousWorstAspectRatio ? currentVectorLayout : previousVectorLayout;
}
function vectorNodeCoordinates(vectorLayout, x0Base, y0Base, vertical) {
    const { nodes, dependentSize, sectionSizes, sectionOffsets } = vectorLayout;
    return nodes.map((e, i) => {
        var _a, _b;
        const offset = (_a = sectionOffsets[i]) !== null && _a !== void 0 ? _a : 0;
        const size = (_b = sectionSizes[i]) !== null && _b !== void 0 ? _b : 0;
        const x0 = vertical ? x0Base + offset : x0Base;
        const y0 = vertical ? y0Base : y0Base + offset;
        const x1 = vertical ? x0 + size : x0 + dependentSize;
        const y1 = vertical ? y0 + dependentSize : y0 + size;
        return { node: e, x0, y0, x1, y1 };
    });
}
const getTopPadding = (requestedTopPadding, fullHeight) => Math.min(requestedTopPadding, fullHeight * MAX_TOP_PADDING_RATIO);
exports.getTopPadding = getTopPadding;
function isThunk(arg) {
    return typeof arg === 'function';
}
function trampoline(fn) {
    return function trampolined(...args) {
        let result = fn(...args);
        while (isThunk(result)) {
            result = result();
        }
        return result;
    };
}
function innerTreemap(nodes, areaAccessor, topPaddingAccessor, paddingAccessor, { x0: outerX0, y0: outerY0, width: outerWidth, height: outerHeight, }, layouts, rescaleAreaFactor = 1) {
    var _a, _b, _c;
    if (nodes.length === 0 || Number.isNaN(outerX0) || Number.isNaN(outerY0))
        return [];
    const depth = ((_b = (_a = nodes[0]) === null || _a === void 0 ? void 0 : _a[1][group_by_rollup_1.DEPTH_KEY]) !== null && _b !== void 0 ? _b : 1) - 1;
    const layerLayout = (_c = layouts[depth]) !== null && _c !== void 0 ? _c : null;
    const vertical = layerLayout === exports.LayerLayout.vertical || (!layerLayout && outerWidth / constants_1.GOLDEN_RATIO <= outerHeight);
    const independentSize = vertical ? outerWidth : outerHeight;
    const vectorElements = bestVector(nodes, independentSize, areaAccessor, layerLayout, rescaleAreaFactor);
    const vector = vectorNodeCoordinates(vectorElements, outerX0, outerY0, vertical);
    const { dependentSize } = vectorElements;
    const moreVectors = vector.some(({ node }) => (0, group_by_rollup_1.entryValue)(node)[group_by_rollup_1.CHILDREN_KEY].length) || nodes.slice(vector.length).length > 0;
    if (!moreVectors) {
        return vector;
    }
    return () => vector.concat(...vector.map(({ node, x0, y0, x1, y1 }) => {
        const childrenNodes = (0, group_by_rollup_1.entryValue)(node)[group_by_rollup_1.CHILDREN_KEY];
        if (childrenNodes.length === 0) {
            return [];
        }
        const fullWidth = x1 - x0;
        const fullHeight = y1 - y0;
        const uPadding = Math.min(paddingAccessor(node), fullWidth * MAX_U_PADDING_RATIO * 2, fullHeight * MAX_U_PADDING_RATIO * 2);
        const topPadding = (0, exports.getTopPadding)(topPaddingAccessor(node), fullHeight);
        const width = fullWidth - 2 * uPadding;
        const height = fullHeight - uPadding - topPadding;
        return (0, exports.treemap)(childrenNodes, areaAccessor, topPaddingAccessor, paddingAccessor, {
            x0: x0 + uPadding,
            y0: y0 + topPadding,
            width,
            height,
        }, layouts, (rescaleAreaFactor * (width * height)) / (fullWidth * fullHeight));
    }), (0, exports.treemap)(nodes.slice(vector.length), areaAccessor, topPaddingAccessor, paddingAccessor, vertical
        ? { x0: outerX0, y0: outerY0 + dependentSize, width: outerWidth, height: outerHeight - dependentSize }
        : { x0: outerX0 + dependentSize, y0: outerY0, width: outerWidth - dependentSize, height: outerHeight }, layouts, rescaleAreaFactor));
}
exports.treemap = trampoline(innerTreemap);
//# sourceMappingURL=treemap.js.map