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
exports.treemap = exports.getTopPadding = exports.LayerLayout = exports.leastSquarishAspectRatio = void 0;
var constants_1 = require("../../../../common/constants");
var group_by_rollup_1 = require("./group_by_rollup");
var MAX_U_PADDING_RATIO = 0.0256197;
var MAX_TOP_PADDING_RATIO = 0.33;
function layVector(nodes, independentSize, areaAccessor) {
    var area = nodes.reduce(function (p, n) { return p + areaAccessor(n); }, 0);
    var dependentSize = area / independentSize;
    var currentOffset = 0;
    var sectionOffsets = [currentOffset];
    var sectionSizes = nodes.map(function (e, i) {
        var sectionSize = areaAccessor(e) / dependentSize;
        if (i < nodes.length - 1)
            sectionOffsets.push((currentOffset += sectionSize));
        return sectionSize;
    });
    return { nodes: nodes, dependentSize: dependentSize, sectionSizes: sectionSizes, sectionOffsets: sectionOffsets };
}
function leastSquarishAspectRatio(_a) {
    var sectionSizes = _a.sectionSizes, dependentSize = _a.dependentSize;
    return sectionSizes.reduce(function (p, n) { return Math.min(p, n / dependentSize, dependentSize / n); }, 1);
}
exports.leastSquarishAspectRatio = leastSquarishAspectRatio;
var NullLayoutElement = {
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
function bestVector(nodes, height, areaAccessor, layout) {
    var previousWorstAspectRatio = -1;
    var currentWorstAspectRatio = 0;
    var previousVectorLayout = NullLayoutElement;
    var currentVectorLayout = NullLayoutElement;
    var currentCount = 1;
    do {
        previousVectorLayout = currentVectorLayout;
        previousWorstAspectRatio = currentWorstAspectRatio;
        currentVectorLayout = layVector(nodes.slice(0, currentCount), height, areaAccessor);
        currentWorstAspectRatio = leastSquarishAspectRatio(currentVectorLayout);
    } while (currentCount++ < nodes.length && (layout || currentWorstAspectRatio > previousWorstAspectRatio));
    return layout || currentWorstAspectRatio >= previousWorstAspectRatio ? currentVectorLayout : previousVectorLayout;
}
function vectorNodeCoordinates(vectorLayout, x0Base, y0Base, vertical) {
    var nodes = vectorLayout.nodes, dependentSize = vectorLayout.dependentSize, sectionSizes = vectorLayout.sectionSizes, sectionOffsets = vectorLayout.sectionOffsets;
    return nodes.map(function (e, i) {
        var x0 = vertical ? x0Base + sectionOffsets[i] : x0Base;
        var y0 = vertical ? y0Base : y0Base + sectionOffsets[i];
        var x1 = vertical ? x0 + sectionSizes[i] : x0 + dependentSize;
        var y1 = vertical ? y0 + dependentSize : y0 + sectionSizes[i];
        return { node: e, x0: x0, y0: y0, x1: x1, y1: y1 };
    });
}
var getTopPadding = function (requestedTopPadding, fullHeight) {
    return Math.min(requestedTopPadding, fullHeight * MAX_TOP_PADDING_RATIO);
};
exports.getTopPadding = getTopPadding;
function treemap(nodes, areaAccessor, topPaddingAccessor, paddingAccessor, _a, layouts) {
    var _b;
    var outerX0 = _a.x0, outerY0 = _a.y0, outerWidth = _a.width, outerHeight = _a.height;
    if (nodes.length === 0)
        return [];
    var depth = nodes[0][1][group_by_rollup_1.DEPTH_KEY] - 1;
    var layerLayout = (_b = layouts[depth]) !== null && _b !== void 0 ? _b : null;
    var vertical = layerLayout === exports.LayerLayout.vertical || (!layerLayout && outerWidth / constants_1.GOLDEN_RATIO <= outerHeight);
    var independentSize = vertical ? outerWidth : outerHeight;
    var vectorElements = bestVector(nodes, independentSize, areaAccessor, layerLayout);
    var vector = vectorNodeCoordinates(vectorElements, outerX0, outerY0, vertical);
    var dependentSize = vectorElements.dependentSize;
    return vector
        .concat.apply(vector, __spreadArray([], __read(vector.map(function (_a) {
        var node = _a.node, x0 = _a.x0, y0 = _a.y0, x1 = _a.x1, y1 = _a.y1;
        var childrenNodes = (0, group_by_rollup_1.entryValue)(node)[group_by_rollup_1.CHILDREN_KEY];
        if (childrenNodes.length === 0) {
            return [];
        }
        var fullWidth = x1 - x0;
        var fullHeight = y1 - y0;
        var uPadding = Math.min(paddingAccessor(node), fullWidth * MAX_U_PADDING_RATIO * 2, fullHeight * MAX_U_PADDING_RATIO * 2);
        var topPadding = (0, exports.getTopPadding)(topPaddingAccessor(node), fullHeight);
        var width = fullWidth - 2 * uPadding;
        var height = fullHeight - uPadding - topPadding;
        return treemap(childrenNodes, function (d) { return ((width * height) / (fullWidth * fullHeight)) * areaAccessor(d); }, topPaddingAccessor, paddingAccessor, {
            x0: x0 + uPadding,
            y0: y0 + topPadding,
            width: width,
            height: height,
        }, layouts);
    })), false)).concat(treemap(nodes.slice(vector.length), areaAccessor, topPaddingAccessor, paddingAccessor, vertical
        ? { x0: outerX0, y0: outerY0 + dependentSize, width: outerWidth, height: outerHeight - dependentSize }
        : { x0: outerX0 + dependentSize, y0: outerY0, width: outerWidth - dependentSize, height: outerHeight }, layouts));
}
exports.treemap = treemap;
//# sourceMappingURL=treemap.js.map