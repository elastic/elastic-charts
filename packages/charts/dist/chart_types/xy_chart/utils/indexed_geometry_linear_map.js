"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedGeometryLinearMap = void 0;
class IndexedGeometryLinearMap {
    constructor() {
        this.map = new Map();
    }
    get size() {
        return this.map.size;
    }
    set(geometry) {
        const { x } = geometry.value;
        const existing = this.map.get(x);
        if (existing === undefined) {
            this.map.set(x, [geometry]);
        }
        else {
            this.map.set(x, [geometry, ...existing]);
        }
    }
    getMergeData() {
        return [...this.map.values()];
    }
    keys() {
        return [...this.map.keys()];
    }
    find(x) {
        var _a;
        if (x === null) {
            return [];
        }
        return (_a = this.map.get(x)) !== null && _a !== void 0 ? _a : [];
    }
}
exports.IndexedGeometryLinearMap = IndexedGeometryLinearMap;
//# sourceMappingURL=indexed_geometry_linear_map.js.map