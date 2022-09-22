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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtra = void 0;
function getExtra(extraValues, item, totalItems) {
    var _a, _b;
    var seriesIdentifiers = item.seriesIdentifiers, defaultExtra = item.defaultExtra, childId = item.childId, path = item.path;
    if (extraValues.size === 0 || seriesIdentifiers.length > 1) {
        return (_a = defaultExtra === null || defaultExtra === void 0 ? void 0 : defaultExtra.formatted) !== null && _a !== void 0 ? _a : '';
    }
    var _c = __read(seriesIdentifiers, 1), key = _c[0].key;
    var extraValueKey = path.map(function (_a) {
        var index = _a.index;
        return index;
    }).join('__');
    var itemExtraValues = extraValues.has(extraValueKey) ? extraValues.get(extraValueKey) : extraValues.get(key);
    var actionExtra = childId !== undefined && (itemExtraValues === null || itemExtraValues === void 0 ? void 0 : itemExtraValues.get(childId));
    return (_b = actionExtra !== null && actionExtra !== void 0 ? actionExtra : (extraValues.size === totalItems ? defaultExtra === null || defaultExtra === void 0 ? void 0 : defaultExtra.formatted : null)) !== null && _b !== void 0 ? _b : '';
}
exports.getExtra = getExtra;
//# sourceMappingURL=utils.js.map