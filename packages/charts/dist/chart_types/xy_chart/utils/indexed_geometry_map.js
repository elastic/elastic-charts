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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexedGeometryMap = exports.GeometryType = void 0;
var common_1 = require("../../../utils/common");
var geometry_1 = require("../../../utils/geometry");
var indexed_geometry_linear_map_1 = require("./indexed_geometry_linear_map");
var indexed_geometry_spatial_map_1 = require("./indexed_geometry_spatial_map");
exports.GeometryType = Object.freeze({
    linear: 'linear',
    spatial: 'spatial',
});
var IndexedGeometryMap = (function () {
    function IndexedGeometryMap() {
        this.linearMap = new indexed_geometry_linear_map_1.IndexedGeometryLinearMap();
        this.spatialMap = new indexed_geometry_spatial_map_1.IndexedGeometrySpatialMap();
    }
    IndexedGeometryMap.prototype.triangulation = function (bounds) {
        return this.spatialMap.triangulation(bounds);
    };
    IndexedGeometryMap.prototype.keys = function () {
        return __spreadArray(__spreadArray([], __read(this.linearMap.keys()), false), __read(this.spatialMap.keys()), false);
    };
    Object.defineProperty(IndexedGeometryMap.prototype, "size", {
        get: function () {
            return this.linearMap.size + this.spatialMap.size;
        },
        enumerable: false,
        configurable: true
    });
    IndexedGeometryMap.prototype.set = function (geometry, type) {
        if (type === void 0) { type = exports.GeometryType.linear; }
        if (type === exports.GeometryType.spatial && (0, geometry_1.isPointGeometry)(geometry)) {
            this.spatialMap.set([geometry]);
        }
        else {
            this.linearMap.set(geometry);
        }
    };
    IndexedGeometryMap.prototype.find = function (x, point, smHorizontalValue, smVerticalValue) {
        if (x === null && !point) {
            return [];
        }
        var spatialValues = point === undefined ? [] : this.spatialMap.find(point);
        return __spreadArray(__spreadArray([], __read(this.linearMap.find(x)), false), __read(spatialValues), false).filter(function (_a) {
            var _b = _a.seriesIdentifier, smHorizontalAccessorValue = _b.smHorizontalAccessorValue, smVerticalAccessorValue = _b.smVerticalAccessorValue;
            return ((0, common_1.isNil)(smVerticalValue) || smVerticalAccessorValue === smVerticalValue) &&
                ((0, common_1.isNil)(smHorizontalValue) || smHorizontalAccessorValue === smHorizontalValue);
        });
    };
    IndexedGeometryMap.prototype.getMergeData = function () {
        return {
            spatialGeometries: this.spatialMap.getMergeData(),
            linearGeometries: this.linearMap.getMergeData(),
        };
    };
    IndexedGeometryMap.prototype.merge = function () {
        var e_1, _a;
        var _this = this;
        var indexedMaps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            indexedMaps[_i] = arguments[_i];
        }
        try {
            for (var indexedMaps_1 = __values(indexedMaps), indexedMaps_1_1 = indexedMaps_1.next(); !indexedMaps_1_1.done; indexedMaps_1_1 = indexedMaps_1.next()) {
                var indexedMap = indexedMaps_1_1.value;
                var _b = indexedMap.getMergeData(), spatialGeometries = _b.spatialGeometries, linearGeometries = _b.linearGeometries;
                this.spatialMap.set(spatialGeometries);
                linearGeometries.forEach(function (geometry) {
                    if (Array.isArray(geometry)) {
                        geometry.forEach(function (geometry) { return _this.linearMap.set(geometry); });
                    }
                    else {
                        _this.linearMap.set(geometry);
                    }
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (indexedMaps_1_1 && !indexedMaps_1_1.done && (_a = indexedMaps_1.return)) _a.call(indexedMaps_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    return IndexedGeometryMap;
}());
exports.IndexedGeometryMap = IndexedGeometryMap;
//# sourceMappingURL=indexed_geometry_map.js.map