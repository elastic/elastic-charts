"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedGeometrySpatialMap = void 0;
const common_1 = require("../../../utils/common");
const d3_delaunay_1 = require("../../../utils/d3-delaunay");
class IndexedGeometrySpatialMap {
    constructor(points = []) {
        this.map = null;
        this.points = [];
        this.pointGeometries = [];
        this.searchStartIndex = 0;
        this.maxRadius = -Infinity;
        this.set(points);
    }
    get size() {
        return this.points.length;
    }
    isSpatial() {
        return this.pointGeometries.length > 0;
    }
    set(points) {
        this.maxRadius = Math.max(this.maxRadius, ...points.map(({ radius }) => radius));
        const { pointGeometries } = this;
        points.forEach((p) => {
            if ((0, common_1.isFiniteNumber)(p.y))
                pointGeometries.push(p);
        });
        this.points.push(...points.map(({ x, y }) => {
            const nonce = Math.random() * 0.000001;
            return [x + nonce, y];
        }));
        if (this.points.length > 0) {
            this.map = d3_delaunay_1.Delaunay.from(this.points);
        }
    }
    triangulation(bounds) {
        var _a;
        return (_a = this.map) === null || _a === void 0 ? void 0 : _a.voronoi(bounds);
    }
    getMergeData() {
        return [...this.pointGeometries];
    }
    keys() {
        return this.pointGeometries.map(({ value: { x } }) => x);
    }
    find(point, pointBuffer) {
        const elements = [];
        if (this.map !== null) {
            const index = this.map.find(point.x, point.y, this.searchStartIndex);
            const geometry = this.pointGeometries[index];
            if (geometry) {
                this.searchStartIndex = index;
                elements.push(geometry);
                this.getRadialNeighbors(index, point, new Set([index]), pointBuffer).forEach((g) => elements.push(g));
            }
        }
        return elements;
    }
    getRadialNeighbors(selectedIndex, point, visitedIndices, pointBuffer) {
        if (this.map === null) {
            return [];
        }
        const neighbors = [...this.map.neighbors(selectedIndex)];
        return neighbors.reduce((acc, i) => {
            if (visitedIndices.has(i)) {
                return acc;
            }
            visitedIndices.add(i);
            const geometry = this.pointGeometries[i];
            if (geometry) {
                acc.push(geometry);
                const radiusBuffer = typeof pointBuffer === 'number' ? pointBuffer : pointBuffer(geometry.radius);
                if ((0, common_1.getDistance)(geometry, point) < Math.min(this.maxRadius, radiusBuffer)) {
                    this.getRadialNeighbors(i, point, visitedIndices, pointBuffer).forEach((g) => acc.push(g));
                }
            }
            return acc;
        }, []);
    }
}
exports.IndexedGeometrySpatialMap = IndexedGeometrySpatialMap;
//# sourceMappingURL=indexed_geometry_spatial_map.js.map