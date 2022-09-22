"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LRUCache = void 0;
var common_1 = require("../utils/common");
var LRUCache = (function () {
    function LRUCache(max) {
        if (max === void 0) { max = 10; }
        this.max = (0, common_1.clamp)(max, 1, Infinity);
        this.cache = new Map();
    }
    LRUCache.prototype.get = function (key) {
        var item = this.cache.get(key);
        if (item) {
            this.cache.delete(key);
            this.cache.set(key, item);
        }
        return item;
    };
    LRUCache.prototype.set = function (key, val) {
        if (this.cache.has(key))
            this.cache.delete(key);
        else if (this.cache.size === this.max)
            this.cache.delete(this.first());
        this.cache.set(key, val);
    };
    LRUCache.prototype.first = function () {
        return this.cache.keys().next().value;
    };
    return LRUCache;
}());
exports.LRUCache = LRUCache;
//# sourceMappingURL=data_structures.js.map