"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highlightedGeoms = exports.LegendStrategy = void 0;
var legendStrategies = {
    node: function (legendPath) {
        return function (_a) {
            var path = _a.path;
            return legendPath.length === path.length &&
                legendPath.every(function (_a, i) {
                    var _b, _c;
                    var index = _a.index, value = _a.value;
                    return index === ((_b = path[i]) === null || _b === void 0 ? void 0 : _b.index) && value === ((_c = path[i]) === null || _c === void 0 ? void 0 : _c.value);
                });
        };
    },
    path: function (legendPath) {
        return function (_a) {
            var path = _a.path;
            return path.every(function (_a, i) {
                var _b, _c;
                var index = _a.index, value = _a.value;
                return index === ((_b = legendPath[i]) === null || _b === void 0 ? void 0 : _b.index) && value === ((_c = legendPath[i]) === null || _c === void 0 ? void 0 : _c.value);
            });
        };
    },
    keyInLayer: function (legendPath) {
        return function (_a) {
            var path = _a.path, dataName = _a.dataName;
            return legendPath.length === path.length && dataName === legendPath[legendPath.length - 1].value;
        };
    },
    key: function (legendPath) {
        return function (_a) {
            var dataName = _a.dataName;
            return dataName === legendPath[legendPath.length - 1].value;
        };
    },
    nodeWithDescendants: function (legendPath) {
        return function (_a) {
            var path = _a.path;
            return legendPath.every(function (_a, i) {
                var _b, _c;
                var index = _a.index, value = _a.value;
                return index === ((_b = path[i]) === null || _b === void 0 ? void 0 : _b.index) && value === ((_c = path[i]) === null || _c === void 0 ? void 0 : _c.value);
            });
        };
    },
    pathWithDescendants: function (legendPath) {
        return function (_a) {
            var path = _a.path;
            return legendPath
                .slice(0, path.length)
                .every(function (_a, i) {
                var _b, _c;
                var index = _a.index, value = _a.value;
                return index === ((_b = path[i]) === null || _b === void 0 ? void 0 : _b.index) && value === ((_c = path[i]) === null || _c === void 0 ? void 0 : _c.value);
            });
        };
    },
};
exports.LegendStrategy = Object.freeze({
    Node: 'node',
    Path: 'path',
    KeyInLayer: 'keyInLayer',
    Key: 'key',
    NodeWithDescendants: 'nodeWithDescendants',
    PathWithDescendants: 'pathWithDescendants',
});
var defaultStrategy = exports.LegendStrategy.Key;
function highlightedGeoms(legendStrategy, flatLegend, quadViewModel, highlightedLegendItemPath) {
    var pickedLogic = flatLegend ? exports.LegendStrategy.Key : legendStrategy !== null && legendStrategy !== void 0 ? legendStrategy : defaultStrategy;
    return quadViewModel.filter(legendStrategies[pickedLogic](highlightedLegendItemPath));
}
exports.highlightedGeoms = highlightedGeoms;
//# sourceMappingURL=highlighted_geoms.js.map