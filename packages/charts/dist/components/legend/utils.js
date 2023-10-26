"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtra = void 0;
function getExtra(extraValues, item, totalItems) {
    var _a, _b;
    const { seriesIdentifiers, defaultExtra, childId, path } = item;
    if (extraValues.size === 0 || seriesIdentifiers.length > 1 || !seriesIdentifiers[0]) {
        return (_a = defaultExtra === null || defaultExtra === void 0 ? void 0 : defaultExtra.formatted) !== null && _a !== void 0 ? _a : '';
    }
    const [{ key }] = seriesIdentifiers;
    const extraValueKey = path.map(({ index }) => index).join('__');
    const itemExtraValues = extraValues.has(extraValueKey) ? extraValues.get(extraValueKey) : extraValues.get(key);
    const actionExtra = childId !== undefined && (itemExtraValues === null || itemExtraValues === void 0 ? void 0 : itemExtraValues.get(childId));
    return (_b = actionExtra !== null && actionExtra !== void 0 ? actionExtra : (extraValues.size === totalItems ? defaultExtra === null || defaultExtra === void 0 ? void 0 : defaultExtra.formatted : null)) !== null && _b !== void 0 ? _b : '';
}
exports.getExtra = getExtra;
//# sourceMappingURL=utils.js.map