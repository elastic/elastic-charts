"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueKey = exports.groupBy = void 0;
function groupBy(data, keysOrKeyFn, asArray) {
    const keyFn = Array.isArray(keysOrKeyFn) ? getUniqueKey(keysOrKeyFn) : keysOrKeyFn;
    const grouped = data.reduce((acc, curr) => {
        const key = keyFn(curr);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(curr);
        return acc;
    }, {});
    return asArray ? Object.values(grouped) : grouped;
}
exports.groupBy = groupBy;
function getUniqueKey(keys, concat = '|') {
    return (data) => {
        return keys
            .map((key) => {
            return data[key];
        })
            .join(concat);
    };
}
exports.getUniqueKey = getUniqueKey;
//# sourceMappingURL=group_data_series.js.map