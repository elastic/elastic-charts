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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomCachedSelector = exports.globalSelectorCache = void 0;
var re_reselect_1 = __importDefault(require("re-reselect"));
var CustomMapCache = (function () {
    function CustomMapCache() {
        this.cache = {};
    }
    CustomMapCache.prototype.set = function (key, selectorFn) {
        this.cache[key] = selectorFn;
    };
    CustomMapCache.prototype.get = function (key) {
        return this.cache[key];
    };
    CustomMapCache.prototype.remove = function (key) {
        delete this.cache[key];
    };
    CustomMapCache.prototype.clear = function () {
        this.cache = {};
    };
    CustomMapCache.prototype.isEmpty = function () {
        return Object.keys(this.cache).length === 0;
    };
    CustomMapCache.prototype.isValidCacheKey = function (key) {
        return typeof key === 'string';
    };
    return CustomMapCache;
}());
var GlobalSelectorCache = (function () {
    function GlobalSelectorCache() {
        this.selectorCaches = [];
    }
    GlobalSelectorCache.keySelector = function (_a) {
        var chartId = _a.chartId;
        return chartId;
    };
    GlobalSelectorCache.prototype.getNewOptions = function () {
        return {
            keySelector: GlobalSelectorCache.keySelector,
            cacheObject: this.getCacheObject(),
        };
    };
    GlobalSelectorCache.prototype.removeKeyFromAll = function (key) {
        this.selectorCaches.forEach(function (cache) {
            cache.remove(key);
        });
    };
    GlobalSelectorCache.prototype.getCacheObject = function () {
        var cache = new CustomMapCache();
        this.selectorCaches.push(cache);
        return cache;
    };
    return GlobalSelectorCache;
}());
exports.globalSelectorCache = new GlobalSelectorCache();
var createCustomCachedSelector = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return re_reselect_1.default.apply(void 0, __spreadArray([], __read(args), false))(exports.globalSelectorCache.getNewOptions());
};
exports.createCustomCachedSelector = createCustomCachedSelector;
//# sourceMappingURL=create_selector.js.map