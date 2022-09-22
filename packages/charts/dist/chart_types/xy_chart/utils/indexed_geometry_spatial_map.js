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
exports.IndexedGeometrySpatialMap = void 0;
var common_1 = require("../../../utils/common");
var d3_delaunay_1 = require("../../../utils/d3-delaunay");
var constants_1 = require("../rendering/constants");
var IndexedGeometrySpatialMap = (function () {
    function IndexedGeometrySpatialMap(points) {
        if (points === void 0) { points = []; }
        this.map = null;
        this.points = [];
        this.pointGeometries = [];
        this.searchStartIndex = 0;
        this.maxRadius = -Infinity;
        this.set(points);
    }
    Object.defineProperty(IndexedGeometrySpatialMap.prototype, "size", {
        get: function () {
            return this.points.length;
        },
        enumerable: false,
        configurable: true
    });
    IndexedGeometrySpatialMap.prototype.isSpatial = function () {
        return this.pointGeometries.length > 0;
    };
    IndexedGeometrySpatialMap.prototype.set = function (points) {
        var _a;
        this.maxRadius = Math.max.apply(Math, __spreadArray([this.maxRadius], __read(points.map(function (_a) {
            var radius = _a.radius;
            return radius;
        })), false));
        var pointGeometries = this.pointGeometries;
        points.forEach(function (p) {
            if ((0, common_1.isFiniteNumber)(p.y))
                pointGeometries.push(p);
        });
        (_a = this.points).push.apply(_a, __spreadArray([], __read(points.map(function (_a) {
            var x = _a.x, y = _a.y;
            var nonce = Math.random() * 0.000001;
            return [x + nonce, y];
        })), false));
        if (this.points.length > 0) {
            this.map = d3_delaunay_1.Delaunay.from(this.points);
        }
    };
    IndexedGeometrySpatialMap.prototype.triangulation = function (bounds) {
        var _a;
        return (_a = this.map) === null || _a === void 0 ? void 0 : _a.voronoi(bounds);
    };
    IndexedGeometrySpatialMap.prototype.getMergeData = function () {
        return __spreadArray([], __read(this.pointGeometries), false);
    };
    IndexedGeometrySpatialMap.prototype.keys = function () {
        return this.pointGeometries.map(function (_a) {
            var x = _a.value.x;
            return x;
        });
    };
    IndexedGeometrySpatialMap.prototype.find = function (point) {
        var elements = [];
        if (this.map !== null) {
            var index = this.map.find(point.x, point.y, this.searchStartIndex);
            var geometry = this.pointGeometries[index];
            if (geometry) {
                this.searchStartIndex = index;
                elements.push(geometry);
                this.getRadialNeighbors(index, point, new Set([index])).forEach(function (g) { return elements.push(g); });
            }
        }
        return elements;
    };
    IndexedGeometrySpatialMap.prototype.getRadialNeighbors = function (selectedIndex, point, visitedIndices) {
        var _this = this;
        if (this.map === null) {
            return [];
        }
        var neighbors = __spreadArray([], __read(this.map.neighbors(selectedIndex)), false);
        return neighbors.reduce(function (acc, i) {
            if (visitedIndices.has(i)) {
                return acc;
            }
            visitedIndices.add(i);
            var geometry = _this.pointGeometries[i];
            if (geometry) {
                acc.push(geometry);
                if ((0, common_1.getDistance)(geometry, point) < Math.min(_this.maxRadius, constants_1.DEFAULT_HIGHLIGHT_PADDING)) {
                    _this.getRadialNeighbors(i, point, visitedIndices).forEach(function (g) { return acc.push(g); });
                }
            }
            return acc;
        }, []);
    };
    return IndexedGeometrySpatialMap;
}());
exports.IndexedGeometrySpatialMap = IndexedGeometrySpatialMap;
//# sourceMappingURL=indexed_geometry_spatial_map.js.map