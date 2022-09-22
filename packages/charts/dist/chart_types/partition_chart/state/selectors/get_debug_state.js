"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugStateSelector = void 0;
var constants_1 = require("../../../../common/constants");
var create_selector_1 = require("../../../../state/create_selector");
var viewmodel_1 = require("../../layout/viewmodel/viewmodel");
var geometries_1 = require("./geometries");
exports.getDebugStateSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.partitionMultiGeometries], function (geoms) {
    return {
        partition: geoms.reduce(function (acc, _a) {
            var layout = _a.layout, panel = _a.panel, quadViewModel = _a.quadViewModel, diskCenter = _a.diskCenter;
            var partitions = quadViewModel.map(function (model) {
                var dataName = model.dataName, depth = model.depth, fillColor = model.fillColor, value = model.value;
                return {
                    name: dataName,
                    depth: depth,
                    color: fillColor,
                    value: value,
                    coords: (0, viewmodel_1.isSunburst)(layout) ? getCoordsForSector(model, diskCenter) : getCoordsForRectangle(model, diskCenter),
                };
            });
            acc.push({
                panelTitle: panel.title,
                partitions: partitions,
            });
            return acc;
        }, []),
    };
});
function getCoordsForSector(_a, diskCenter) {
    var x0 = _a.x0, x1 = _a.x1, y1px = _a.y1px, y0px = _a.y0px;
    var X0 = x0 - constants_1.TAU / 4;
    var X1 = x1 - constants_1.TAU / 4;
    var cr = y0px + (y1px - y0px) / 2;
    var angle = X0 + (X1 - X0) / 2;
    var x = Math.round(Math.cos(angle) * cr + diskCenter.x);
    var y = Math.round(Math.sin(angle) * cr + diskCenter.y);
    return [x, y];
}
function getCoordsForRectangle(_a, diskCenter) {
    var x0 = _a.x0, x1 = _a.x1, y1px = _a.y1px, y0px = _a.y0px;
    var y = Math.round(y0px + (y1px - y0px) / 2 + diskCenter.y);
    var x = Math.round(x0 + (x1 - x0) / 2 + diskCenter.x);
    return [x, y];
}
//# sourceMappingURL=get_debug_state.js.map