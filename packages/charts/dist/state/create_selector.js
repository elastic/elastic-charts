"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomCachedSelector = exports.globalSelectorCache = void 0;
const re_reselect_1 = __importDefault(require("re-reselect"));
class CustomMapCache {
    constructor() {
        this.cache = {};
    }
    set(key, selectorFn) {
        this.cache[key] = selectorFn;
    }
    get(key) {
        return this.cache[key];
    }
    remove(key) {
        delete this.cache[key];
    }
    clear() {
        this.cache = {};
    }
    isEmpty() {
        return Object.keys(this.cache).length === 0;
    }
    isValidCacheKey(key) {
        return typeof key === 'string';
    }
}
class GlobalSelectorCache {
    constructor() {
        this.selectorCaches = [];
    }
    static keySelector({ chartId }) {
        return chartId;
    }
    getNewOptions() {
        return {
            keySelector: GlobalSelectorCache.keySelector,
            cacheObject: this.getCacheObject(),
        };
    }
    removeKeyFromAll(key) {
        this.selectorCaches.forEach((cache) => {
            cache.remove(key);
        });
    }
    getCacheObject() {
        const cache = new CustomMapCache();
        this.selectorCaches.push(cache);
        return cache;
    }
}
exports.globalSelectorCache = new GlobalSelectorCache();
const createCustomCachedSelector = (...args) => {
    return (0, re_reselect_1.default)(...args)(exports.globalSelectorCache.getNewOptions());
};
exports.createCustomCachedSelector = createCustomCachedSelector;
//# sourceMappingURL=create_selector.js.map