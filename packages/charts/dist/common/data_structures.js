"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LRUCache = void 0;
const common_1 = require("../utils/common");
class LRUCache {
    constructor(max = 10) {
        this.max = (0, common_1.clamp)(max, 1, Infinity);
        this.cache = new Map();
    }
    get(key) {
        const item = this.cache.get(key);
        if (item) {
            this.cache.delete(key);
            this.cache.set(key, item);
        }
        return item;
    }
    set(key, val) {
        if (this.cache.has(key))
            this.cache.delete(key);
        else if (this.cache.size === this.max)
            this.cache.delete(this.first());
        this.cache.set(key, val);
    }
    first() {
        return this.cache.keys().next().value;
    }
}
exports.LRUCache = LRUCache;
//# sourceMappingURL=data_structures.js.map