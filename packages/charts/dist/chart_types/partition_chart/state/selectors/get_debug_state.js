"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugStateSelector = void 0;
const geometries_1 = require("./geometries");
const constants_1 = require("../../../../common/constants");
const create_selector_1 = require("../../../../state/create_selector");
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
exports.getDebugStateSelector = (0, create_selector_1.createCustomCachedSelector)([geometries_1.partitionMultiGeometries], (geoms) => {
    return {
        partition: geoms.reduce((acc, { layout, panel, quadViewModel, diskCenter }) => {
            const partitions = quadViewModel.map((model) => {
                const { dataName, depth, fillColor, value } = model;
                return {
                    name: dataName,
                    depth,
                    color: fillColor,
                    value,
                    coords: (0, viewmodel_1.isSunburst)(layout) ? getCoordsForSector(model, diskCenter) : getCoordsForRectangle(model, diskCenter),
                };
            });
            acc.push({
                panelTitle: panel.title,
                partitions,
            });
            return acc;
        }, []),
    };
});
function getCoordsForSector({ x0, x1, y1px, y0px }, diskCenter) {
    const X0 = x0 - constants_1.TAU / 4;
    const X1 = x1 - constants_1.TAU / 4;
    const cr = y0px + (y1px - y0px) / 2;
    const angle = X0 + (X1 - X0) / 2;
    const x = Math.round(Math.cos(angle) * cr + diskCenter.x);
    const y = Math.round(Math.sin(angle) * cr + diskCenter.y);
    return [x, y];
}
function getCoordsForRectangle({ x0, x1, y1px, y0px }, diskCenter) {
    const y = Math.round(y0px + (y1px - y0px) / 2 + diskCenter.y);
    const x = Math.round(x0 + (x1 - x0) / 2 + diskCenter.x);
    return [x, y];
}
//# sourceMappingURL=get_debug_state.js.map