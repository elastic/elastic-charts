"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItems = void 0;
var iterables_1 = require("../../../../common/iterables");
var legend_1 = require("../../../../utils/legend");
var config_types_1 = require("../types/config_types");
function makeKey() {
    var keyParts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keyParts[_i] = arguments[_i];
    }
    return keyParts.join('---');
}
function compareTreePaths(_a, _b) {
    var oiA = _a.index, iiA = _a.innerIndex, a = _a.path;
    var oiB = _b.index, iiB = _b.innerIndex, b = _b.path;
    if (oiA !== oiB)
        return oiA - oiB;
    if (iiA !== iiB)
        return iiA - iiB;
    for (var i = 0; i < Math.min(a.length, b.length); i++) {
        var diff = a[i].index - b[i].index;
        if (diff) {
            return diff;
        }
    }
    return a.length - b.length;
}
function getLegendItems(id, layers, flatLegend, legendMaxDepth, legendPosition, quadViewModel, partitionLayout) {
    var uniqueNames = new Set((0, iterables_1.map)(function (_a) {
        var dataName = _a.dataName, fillColor = _a.fillColor;
        return makeKey(dataName, fillColor);
    }, quadViewModel));
    var useHierarchicalLegend = (0, legend_1.isHierarchicalLegend)(flatLegend, legendPosition);
    var formattedLabel = function (_a) {
        var _b;
        var dataName = _a.dataName, depth = _a.depth;
        var formatter = (_b = layers[depth - 1]) === null || _b === void 0 ? void 0 : _b.nodeLabel;
        return formatter ? formatter(dataName) : dataName;
    };
    function compareNames(aItem, bItem) {
        var a = formattedLabel(aItem);
        var b = formattedLabel(bItem);
        return a < b ? -1 : a > b ? 1 : 0;
    }
    function descendingValues(aItem, bItem) {
        return aItem.depth - bItem.depth || bItem.value - aItem.value;
    }
    var excluded = new Set();
    var items = quadViewModel.filter(function (_a) {
        var depth = _a.depth, dataName = _a.dataName, fillColor = _a.fillColor;
        if (legendMaxDepth !== null && depth > legendMaxDepth) {
            return false;
        }
        if (!useHierarchicalLegend) {
            var key = makeKey(dataName, fillColor);
            if (uniqueNames.has(key) && excluded.has(key)) {
                return false;
            }
            excluded.add(key);
        }
        return true;
    });
    items.sort(partitionLayout === config_types_1.PartitionLayout.waffle
        ? descendingValues
        : flatLegend
            ? compareNames
            : compareTreePaths);
    return items.map(function (item) {
        var dataName = item.dataName, fillColor = item.fillColor, depth = item.depth, path = item.path;
        return {
            color: fillColor,
            label: formattedLabel(item),
            childId: dataName,
            depth: useHierarchicalLegend ? depth - 1 : 0,
            path: path,
            seriesIdentifiers: [{ key: dataName, specId: id }],
            keys: [],
        };
    });
}
exports.getLegendItems = getLegendItems;
//# sourceMappingURL=legend.js.map