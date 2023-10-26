"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasKey = exports.getPredicateFn = exports.Predicate = void 0;
exports.Predicate = Object.freeze({
    NumAsc: 'numAsc',
    NumDesc: 'numDesc',
    AlphaAsc: 'alphaAsc',
    AlphaDesc: 'alphaDesc',
    DataIndex: 'dataIndex',
});
function getPredicateFn(predicate, locale, accessor) {
    switch (predicate) {
        case 'alphaAsc':
            return (a, b) => {
                const aValue = String(accessor ? a[accessor] : a);
                const bValue = String(accessor ? b[accessor] : b);
                return aValue.localeCompare(bValue, locale);
            };
        case 'alphaDesc':
            return (a, b) => {
                const aValue = String(accessor ? a[accessor] : a);
                const bValue = String(accessor ? b[accessor] : b);
                return bValue.localeCompare(aValue, locale);
            };
        case 'numDesc':
            return (a, b) => {
                const aValue = Number(accessor ? a[accessor] : a);
                const bValue = Number(accessor ? b[accessor] : b);
                return bValue - aValue;
            };
        case 'numAsc':
            return (a, b) => {
                const aValue = Number(accessor ? a[accessor] : a);
                const bValue = Number(accessor ? b[accessor] : b);
                return aValue - bValue;
            };
        case 'dataIndex':
            return () => 0;
    }
}
exports.getPredicateFn = getPredicateFn;
const hasKey = (obj, key) => obj.hasOwnProperty(key);
exports.hasKey = hasKey;
//# sourceMappingURL=predicate.js.map