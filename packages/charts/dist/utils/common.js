"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampAll = exports.isBetween = exports.stripUndefined = exports.isNonNullablePrimitiveValue = exports.isFiniteNumber = exports.getOppositeAlignment = exports.range = exports.safeFormat = exports.toEntries = exports.keepDistinct = exports.getPercentageValue = exports.round = exports.isDefinedFrom = exports.isDefined = exports.hasMostlyRTLItems = exports.isRTLString = exports.isUniqueArray = exports.stringifyNullsUndefined = exports.getDistance = exports.mergePartial = exports.renderComplexChildren = exports.renderWithProps = exports.shallowClone = exports.hasPartialObjectToMerge = exports.isNil = exports.isArrayOrSet = exports.getAllKeys = exports.getPartialValue = exports.htmlIdGenerator = exports.radToDeg = exports.degToRad = exports.getColorFromVariant = exports.clamp = exports.compareByValueAsc = exports.VerticalAlignment = exports.HorizontalAlignment = exports.ColorVariant = exports.LayoutDirection = exports.Position = void 0;
const react_1 = __importStar(require("react"));
const utility_types_1 = require("utility-types");
const uuid_1 = require("uuid");
const colors_1 = require("../common/colors");
exports.Position = Object.freeze({
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right',
});
exports.LayoutDirection = Object.freeze({
    Horizontal: 'horizontal',
    Vertical: 'vertical',
});
exports.ColorVariant = Object.freeze({
    Series: '__use__series__color__',
    None: '__use__empty__color__',
    Adaptive: '__use__adaptive__color__',
});
exports.HorizontalAlignment = Object.freeze({
    Center: 'center',
    Right: exports.Position.Right,
    Left: exports.Position.Left,
    Near: 'near',
    Far: 'far',
});
exports.VerticalAlignment = Object.freeze({
    Middle: 'middle',
    Top: exports.Position.Top,
    Bottom: exports.Position.Bottom,
    Near: 'near',
    Far: 'far',
});
function compareByValueAsc(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}
exports.compareByValueAsc = compareByValueAsc;
function clamp(value, lowerBound, upperBound) {
    return Math.min(Math.max(value, lowerBound), upperBound);
}
exports.clamp = clamp;
function getColorFromVariant(seriesColor, color) {
    if (color === exports.ColorVariant.Series) {
        return seriesColor;
    }
    if (color === exports.ColorVariant.None) {
        return colors_1.Colors.Transparent.keyword;
    }
    return color || seriesColor;
}
exports.getColorFromVariant = getColorFromVariant;
const degToRad = (angle) => (angle / 180) * Math.PI;
exports.degToRad = degToRad;
const radToDeg = (radian) => (radian * 180) / Math.PI;
exports.radToDeg = radToDeg;
function htmlIdGenerator(idPrefix) {
    const prefix = idPrefix || `i${(0, uuid_1.v1)()}`;
    return (suffix) => `${prefix}_${suffix || (0, uuid_1.v1)()}`;
}
exports.htmlIdGenerator = htmlIdGenerator;
function getPartialValue(base, partial, partials = []) {
    const partialWithValue = partial !== undefined ? partial : partials.find((v) => v !== undefined);
    return partialWithValue !== undefined ? partialWithValue : base;
}
exports.getPartialValue = getPartialValue;
function getAllKeys(object, objects = []) {
    return new Set([object, ...objects].filter(Boolean).reduce((keys, obj) => {
        if (obj && typeof obj === 'object') {
            const newKeys = obj instanceof Map ? obj.keys() : Object.keys(obj);
            keys.push(...newKeys);
        }
        return keys;
    }, []));
}
exports.getAllKeys = getAllKeys;
function isArrayOrSet(value) {
    return Array.isArray(value) || value instanceof Set;
}
exports.isArrayOrSet = isArrayOrSet;
function isNil(value) {
    return value === null || value === undefined;
}
exports.isNil = isNil;
function hasPartialObjectToMerge(base, partial, additionalPartials = []) {
    if (isArrayOrSet(base)) {
        return false;
    }
    if (typeof base === 'object' && base !== null) {
        if (typeof partial === 'object' && !isArrayOrSet(partial) && partial !== null) {
            return true;
        }
        return additionalPartials.some((p) => typeof p === 'object' && !Array.isArray(p));
    }
    return false;
}
exports.hasPartialObjectToMerge = hasPartialObjectToMerge;
function shallowClone(value) {
    if (Array.isArray(value)) {
        return [...value];
    }
    if (value instanceof Set) {
        return new Set(value);
    }
    if (typeof value === 'object' && value !== null) {
        if (value instanceof Map) {
            return new Map(value.entries());
        }
        return { ...value };
    }
    return value;
}
exports.shallowClone = shallowClone;
function isReactNode(el) {
    return isNil(el) || (0, utility_types_1.isPrimitive)(el) || (0, react_1.isValidElement)(el);
}
function isReactComponent(el) {
    return !isReactNode(el);
}
function renderWithProps(El, props) {
    return isReactComponent(El) ? react_1.default.createElement(El, props) : El;
}
exports.renderWithProps = renderWithProps;
function renderComplexChildren(children) {
    return (() => react_1.default.createElement(react_1.default.Fragment, null, children))();
}
exports.renderComplexChildren = renderComplexChildren;
function mergePartial(base, partial, options = {}, additionalPartials = []) {
    var _a;
    const baseClone = shallowClone(base);
    if (hasPartialObjectToMerge(base, partial, additionalPartials)) {
        const mapCondition = !(baseClone instanceof Map) || options.mergeMaps;
        const partialKeys = getAllKeys(partial, additionalPartials);
        if (partialKeys.size > 0 && ((_a = options.mergeOptionalPartialValues) !== null && _a !== void 0 ? _a : true) && mapCondition) {
            partialKeys.forEach((key) => {
                var _a;
                if (baseClone instanceof Map) {
                    if (!baseClone.has(key)) {
                        baseClone.set(key, partial.get(key) !== undefined
                            ? partial.get(key)
                            : additionalPartials.find((v) => v.get(key) !== undefined) || new Map().get(key));
                    }
                }
                else if (!(key in baseClone)) {
                    baseClone[key] =
                        (partial === null || partial === void 0 ? void 0 : partial[key]) !== undefined
                            ? partial[key]
                            : ((_a = additionalPartials.find((v) => (v === null || v === void 0 ? void 0 : v[key]) !== undefined)) !== null && _a !== void 0 ? _a : {})[key];
                }
            });
        }
        if (baseClone instanceof Map) {
            if (options.mergeMaps) {
                return [...baseClone.keys()].reduce((newBase, key) => {
                    const partialValue = partial && partial.get(key);
                    const partialValues = additionalPartials.map((v) => typeof v === 'object' && v instanceof Map ? v.get(key) : undefined);
                    const baseValue = base.get(key);
                    newBase.set(key, mergePartial(baseValue, partialValue, options, partialValues));
                    return newBase;
                }, baseClone);
            }
            if (partial !== undefined) {
                return partial;
            }
            const additional = additionalPartials.find((p) => p !== undefined);
            if (additional) {
                return additional;
            }
            return baseClone;
        }
        return Object.keys(baseClone).reduce((newBase, key) => {
            const partialValue = partial && partial[key];
            const partialValues = additionalPartials.map((v) => (typeof v === 'object' ? v[key] : undefined));
            const baseValue = base[key];
            newBase[key] = mergePartial(baseValue, partialValue, options, partialValues);
            return newBase;
        }, baseClone);
    }
    return getPartialValue(baseClone, partial, additionalPartials);
}
exports.mergePartial = mergePartial;
function getDistance(a, b) {
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}
exports.getDistance = getDistance;
function stringifyNullsUndefined(value) {
    if (value === undefined) {
        return 'undefined';
    }
    if (value === null) {
        return 'null';
    }
    return value;
}
exports.stringifyNullsUndefined = stringifyNullsUndefined;
function isUniqueArray(arr, extractor) {
    const values = new Set();
    return (function isUniqueArrayFn() {
        return arr.every((v) => {
            const value = extractor ? extractor(v) : v;
            if (values.has(value)) {
                return false;
            }
            values.add(value);
            return true;
        });
    })();
}
exports.isUniqueArray = isUniqueArray;
function isRTLString(s, ratio = 0.5) {
    const stripped = s.replaceAll(/[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]|\s|\d/gi, '');
    return stripped.length / s.replaceAll(/\s|\d/gi, '').length < ratio;
}
exports.isRTLString = isRTLString;
function hasMostlyRTLItems(items, ratio = 0.5) {
    const filteredItems = items.filter(Boolean);
    const rtlItemCount = filteredItems.filter((s) => isRTLString(s)).length;
    return rtlItemCount / filteredItems.length > ratio;
}
exports.hasMostlyRTLItems = hasMostlyRTLItems;
function isDefined(value) {
    return value !== null && value !== undefined;
}
exports.isDefined = isDefined;
function isDefinedFrom(typeCheck) {
    return (value) => {
        if (value === undefined) {
            return false;
        }
        try {
            return typeCheck(value);
        }
        catch {
            return false;
        }
    };
}
exports.isDefinedFrom = isDefinedFrom;
const round = (value, fractionDigits = 0) => {
    const precision = Math.pow(10, Math.max(fractionDigits, 0));
    const scaledValue = Math.floor(value * precision);
    return scaledValue / precision;
};
exports.round = round;
function getPercentageValue(ratio, relativeValue, defaultValue) {
    if (typeof ratio === 'number') {
        return Math.abs(ratio);
    }
    const ratioStr = ratio.trim();
    if (/\d+%$/.test(ratioStr)) {
        const percentage = Math.abs(Number.parseInt(ratioStr.slice(0, -1), 10));
        return relativeValue * (percentage / 100);
    }
    const num = Number.parseFloat(ratioStr);
    return Number.isFinite(num) ? Math.abs(num) : defaultValue;
}
exports.getPercentageValue = getPercentageValue;
function keepDistinct(d, i, a) {
    return a.indexOf(d) === i;
}
exports.keepDistinct = keepDistinct;
function toEntries(array, accessor, staticValue) {
    return array.reduce((acc, curr) => {
        acc[curr[accessor]] = staticValue;
        return acc;
    }, {});
}
exports.toEntries = toEntries;
function safeFormat(value, formatter) {
    if (formatter) {
        try {
            return formatter(value);
        }
        catch {
        }
    }
    return `${value}`;
}
exports.safeFormat = safeFormat;
const range = (from, to, step) => Array.from({ length: Math.abs(Math.round((to - from) / (step || 1))) }, (_, i) => from + i * step);
exports.range = range;
const oppositeAlignmentMap = {
    [exports.HorizontalAlignment.Left]: exports.HorizontalAlignment.Right,
    [exports.HorizontalAlignment.Right]: exports.HorizontalAlignment.Left,
    [exports.VerticalAlignment.Top]: exports.VerticalAlignment.Bottom,
    [exports.VerticalAlignment.Bottom]: exports.VerticalAlignment.Top,
};
function getOppositeAlignment(alignment) {
    var _a;
    return (_a = oppositeAlignmentMap[alignment]) !== null && _a !== void 0 ? _a : alignment;
}
exports.getOppositeAlignment = getOppositeAlignment;
function isFiniteNumber(value) {
    return Number.isFinite(value);
}
exports.isFiniteNumber = isFiniteNumber;
function isNonNullablePrimitiveValue(value) {
    return typeof value === 'string' || typeof value === 'number';
}
exports.isNonNullablePrimitiveValue = isNonNullablePrimitiveValue;
function stripUndefined(source) {
    return Object.keys(source).reduce((acc, key) => {
        const val = source[key];
        if (val !== undefined) {
            acc[key] = val;
        }
        return acc;
    }, {});
}
exports.stripUndefined = stripUndefined;
const isBetween = (min, max, exclusive = false) => exclusive ? (n) => n < max && n > min : (n) => n <= max && n >= min;
exports.isBetween = isBetween;
const clampAll = (min, max) => {
    const seen = new Set();
    return [
        (acc, n) => {
            const clampValue = clamp(n, min, max);
            if (!seen.has(clampValue))
                acc.push(clampValue);
            seen.add(clampValue);
            return acc;
        },
        [],
    ];
};
exports.clampAll = clampAll;
//# sourceMappingURL=common.js.map