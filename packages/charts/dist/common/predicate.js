"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPredicateFn = exports.Predicate = void 0;
exports.Predicate = Object.freeze({
    NumAsc: 'numAsc',
    NumDesc: 'numDesc',
    AlphaAsc: 'alphaAsc',
    AlphaDesc: 'alphaDesc',
    DataIndex: 'dataIndex',
});
function getPredicateFn(predicate, accessor) {
    switch (predicate) {
        case 'alphaAsc':
            return function (a, b) {
                var aValue = String(accessor ? a[accessor] : a);
                var bValue = String(accessor ? b[accessor] : b);
                return aValue.localeCompare(bValue);
            };
        case 'alphaDesc':
            return function (a, b) {
                var aValue = String(accessor ? a[accessor] : a);
                var bValue = String(accessor ? b[accessor] : b);
                return bValue.localeCompare(aValue);
            };
        case 'numDesc':
            return function (a, b) {
                var aValue = Number(accessor ? a[accessor] : a);
                var bValue = Number(accessor ? b[accessor] : b);
                return bValue - aValue;
            };
        case 'numAsc':
            return function (a, b) {
                var aValue = Number(accessor ? a[accessor] : a);
                var bValue = Number(accessor ? b[accessor] : b);
                return aValue - bValue;
            };
        case 'dataIndex':
            return function () { return 0; };
    }
}
exports.getPredicateFn = getPredicateFn;
//# sourceMappingURL=predicate.js.map