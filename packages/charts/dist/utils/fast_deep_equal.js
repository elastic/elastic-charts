"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepEqual = void 0;
function deepEqual(a, b, partial = false) {
    var _a;
    if (a === b)
        return true;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        if (a.constructor !== b.constructor)
            return false;
        let length;
        let i;
        if (Array.isArray(a)) {
            length = a.length;
            if (length !== b.length)
                return false;
            for (i = length; i-- !== 0;)
                if (!deepEqual(a[i], b[i]))
                    return false;
            return true;
        }
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size)
                return false;
            for (i of a.entries())
                if (!b.has(i[0]))
                    return false;
            for (i of a.entries())
                if (!deepEqual(i[1], b.get(i[0])))
                    return false;
            return true;
        }
        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size)
                return false;
            for (i of a.entries())
                if (!b.has(i[0]))
                    return false;
            return true;
        }
        if (a.constructor === RegExp)
            return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf)
            return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString)
            return a.toString() === b.toString();
        const keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length && !partial)
            return false;
        for (i = length; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(b, (_a = keys[i]) !== null && _a !== void 0 ? _a : ''))
                return false;
        for (i = length; i-- !== 0;) {
            const key = keys[i];
            if (!key || (key === '_owner' && a.$$typeof)) {
                continue;
            }
            if (!deepEqual(a[key], b[key]))
                return false;
        }
        return true;
    }
    return a !== a && b !== b;
}
exports.deepEqual = deepEqual;
//# sourceMappingURL=fast_deep_equal.js.map