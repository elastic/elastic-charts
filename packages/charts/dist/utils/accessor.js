"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessorValue = exports.getAccessorFormatLabel = exports.getAccessorFn = void 0;
function getAccessorFn(accessor) {
    return (datum) => typeof datum === 'object' && datum !== null ? datum[accessor] : undefined;
}
exports.getAccessorFn = getAccessorFn;
function getAccessorFormatLabel(accessor, label) {
    if (typeof accessor === 'string') {
        return `${label}${accessor}`;
    }
    return accessor(label);
}
exports.getAccessorFormatLabel = getAccessorFormatLabel;
function getAccessorValue(datum, accessor) {
    if (typeof accessor === 'function') {
        return accessor(datum);
    }
    try {
        return datum[accessor];
    }
    catch {
        return undefined;
    }
}
exports.getAccessorValue = getAccessorValue;
//# sourceMappingURL=accessor.js.map