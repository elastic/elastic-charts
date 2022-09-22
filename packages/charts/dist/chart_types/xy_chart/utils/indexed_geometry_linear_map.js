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
exports.IndexedGeometryLinearMap = void 0;
var IndexedGeometryLinearMap = (function () {
    function IndexedGeometryLinearMap() {
        this.map = new Map();
    }
    Object.defineProperty(IndexedGeometryLinearMap.prototype, "size", {
        get: function () {
            return this.map.size;
        },
        enumerable: false,
        configurable: true
    });
    IndexedGeometryLinearMap.prototype.set = function (geometry) {
        var x = geometry.value.x;
        var existing = this.map.get(x);
        if (existing === undefined) {
            this.map.set(x, [geometry]);
        }
        else {
            this.map.set(x, __spreadArray([geometry], __read(existing), false));
        }
    };
    IndexedGeometryLinearMap.prototype.getMergeData = function () {
        return __spreadArray([], __read(this.map.values()), false);
    };
    IndexedGeometryLinearMap.prototype.keys = function () {
        return __spreadArray([], __read(this.map.keys()), false);
    };
    IndexedGeometryLinearMap.prototype.find = function (x) {
        var _a;
        if (x === null) {
            return [];
        }
        return (_a = this.map.get(x)) !== null && _a !== void 0 ? _a : [];
    };
    return IndexedGeometryLinearMap;
}());
exports.IndexedGeometryLinearMap = IndexedGeometryLinearMap;
//# sourceMappingURL=indexed_geometry_linear_map.js.map