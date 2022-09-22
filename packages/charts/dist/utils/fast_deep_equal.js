"use strict";
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
exports.deepEqual = void 0;
function deepEqual(a, b, partial) {
    var e_1, _a, e_2, _b, e_3, _c;
    if (partial === void 0) { partial = false; }
    if (a === b)
        return true;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
        if (a.constructor !== b.constructor)
            return false;
        var length_1;
        var i = void 0;
        if (Array.isArray(a)) {
            length_1 = a.length;
            if (length_1 !== b.length)
                return false;
            for (i = length_1; i-- !== 0;)
                if (!deepEqual(a[i], b[i]))
                    return false;
            return true;
        }
        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size)
                return false;
            try {
                for (var _d = __values(a.entries()), _e = _d.next(); !_e.done; _e = _d.next()) {
                    i = _e.value;
                    if (!b.has(i[0]))
                        return false;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _f = __values(a.entries()), _g = _f.next(); !_g.done; _g = _f.next()) {
                    i = _g.value;
                    if (!deepEqual(i[1], b.get(i[0])))
                        return false;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return true;
        }
        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size)
                return false;
            try {
                for (var _h = __values(a.entries()), _j = _h.next(); !_j.done; _j = _h.next()) {
                    i = _j.value;
                    if (!b.has(i[0]))
                        return false;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return true;
        }
        if (a.constructor === RegExp)
            return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf)
            return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString)
            return a.toString() === b.toString();
        var keys = Object.keys(a);
        length_1 = keys.length;
        if (length_1 !== Object.keys(b).length && !partial)
            return false;
        for (i = length_1; i-- !== 0;)
            if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
                return false;
        for (i = length_1; i-- !== 0;) {
            var key = keys[i];
            if (key === '_owner' && a.$$typeof) {
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