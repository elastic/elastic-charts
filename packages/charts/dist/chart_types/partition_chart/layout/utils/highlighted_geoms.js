"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightedGeoms = exports.LegendStrategy = void 0;
const legendStrategies = {
    node: (legendPath) => ({ path }) => legendPath.length === path.length &&
        legendPath.every(({ index, value }, i) => { var _a, _b; return index === ((_a = path[i]) === null || _a === void 0 ? void 0 : _a.index) && value === ((_b = path[i]) === null || _b === void 0 ? void 0 : _b.value); }),
    path: (legendPath) => ({ path }) => path.every(({ index, value }, i) => { var _a, _b; return index === ((_a = legendPath[i]) === null || _a === void 0 ? void 0 : _a.index) && value === ((_b = legendPath[i]) === null || _b === void 0 ? void 0 : _b.value); }),
    keyInLayer: (legendPath) => ({ path, dataName }) => { var _a; return legendPath.length === path.length && dataName === ((_a = legendPath.at(-1)) === null || _a === void 0 ? void 0 : _a.value); },
    key: (legendPath) => ({ dataName }) => { var _a; return dataName === ((_a = legendPath.at(-1)) === null || _a === void 0 ? void 0 : _a.value); },
    nodeWithDescendants: (legendPath) => ({ path }) => legendPath.every(({ index, value }, i) => { var _a, _b; return index === ((_a = path[i]) === null || _a === void 0 ? void 0 : _a.index) && value === ((_b = path[i]) === null || _b === void 0 ? void 0 : _b.value); }),
    pathWithDescendants: (legendPath) => ({ path }) => legendPath
        .slice(0, path.length)
        .every(({ index, value }, i) => { var _a, _b; return index === ((_a = path[i]) === null || _a === void 0 ? void 0 : _a.index) && value === ((_b = path[i]) === null || _b === void 0 ? void 0 : _b.value); }),
};
exports.LegendStrategy = Object.freeze({
    Node: 'node',
    Path: 'path',
    KeyInLayer: 'keyInLayer',
    Key: 'key',
    NodeWithDescendants: 'nodeWithDescendants',
    PathWithDescendants: 'pathWithDescendants',
});
const defaultStrategy = exports.LegendStrategy.Path;
function highlightedGeoms(legendStrategy, flatLegend, quadViewModel, highlightedLegendItemPath) {
    return quadViewModel.filter(legendStrategies[legendStrategy !== null && legendStrategy !== void 0 ? legendStrategy : defaultStrategy](highlightedLegendItemPath));
}
exports.highlightedGeoms = highlightedGeoms;
//# sourceMappingURL=highlighted_geoms.js.map