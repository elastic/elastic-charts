"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedGeometryMap = exports.GeometryType = void 0;
const indexed_geometry_linear_map_1 = require("./indexed_geometry_linear_map");
const indexed_geometry_spatial_map_1 = require("./indexed_geometry_spatial_map");
const common_1 = require("../../../utils/common");
const geometry_1 = require("../../../utils/geometry");
exports.GeometryType = Object.freeze({
    linear: 'linear',
    spatial: 'spatial',
});
class IndexedGeometryMap {
    constructor() {
        this.linearMap = new indexed_geometry_linear_map_1.IndexedGeometryLinearMap();
        this.spatialMap = new indexed_geometry_spatial_map_1.IndexedGeometrySpatialMap();
    }
    triangulation(bounds) {
        return this.spatialMap.triangulation(bounds);
    }
    keys() {
        return [...this.linearMap.keys(), ...this.spatialMap.keys()];
    }
    get size() {
        return this.linearMap.size + this.spatialMap.size;
    }
    set(geometry, type = exports.GeometryType.linear) {
        if (type === exports.GeometryType.spatial && (0, geometry_1.isPointGeometry)(geometry)) {
            this.spatialMap.set([geometry]);
        }
        else {
            this.linearMap.set(geometry);
        }
    }
    find(x, pointBuffer, point, smHorizontalValue, smVerticalValue) {
        if (x === null && !point) {
            return [];
        }
        const spatialValues = point === undefined ? [] : this.spatialMap.find(point, pointBuffer);
        return [...this.linearMap.find(x), ...spatialValues].filter(({ seriesIdentifier: { smHorizontalAccessorValue, smVerticalAccessorValue } }) => ((0, common_1.isNil)(smVerticalValue) || smVerticalAccessorValue === smVerticalValue) &&
            ((0, common_1.isNil)(smHorizontalValue) || smHorizontalAccessorValue === smHorizontalValue));
    }
    getMergeData() {
        return {
            spatialGeometries: this.spatialMap.getMergeData(),
            linearGeometries: this.linearMap.getMergeData(),
        };
    }
    merge(...indexedMaps) {
        for (const indexedMap of indexedMaps) {
            const { spatialGeometries, linearGeometries } = indexedMap.getMergeData();
            this.spatialMap.set(spatialGeometries);
            linearGeometries.forEach((geometry) => {
                if (Array.isArray(geometry)) {
                    geometry.forEach((geometry) => this.linearMap.set(geometry));
                }
                else {
                    this.linearMap.set(geometry);
                }
            });
        }
    }
}
exports.IndexedGeometryMap = IndexedGeometryMap;
//# sourceMappingURL=indexed_geometry_map.js.map