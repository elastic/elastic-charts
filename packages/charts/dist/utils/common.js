"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampAll = exports.isBetween = exports.stripUndefined = exports.isNonNullablePrimitiveValue = exports.isFiniteNumber = exports.getOppositeAlignment = exports.range = exports.safeFormat = exports.toEntries = exports.keepDistinct = exports.getPercentageValue = exports.round = exports.isDefinedFrom = exports.isDefined = exports.hasMostlyRTLItems = exports.isRTLString = exports.isUniqueArray = exports.stringifyNullsUndefined = exports.getDistance = exports.mergePartial = exports.renderComplexChildren = exports.renderWithProps = exports.shallowClone = exports.hasPartialObjectToMerge = exports.isNil = exports.isArrayOrSet = exports.getAllKeys = exports.getPartialValue = exports.htmlIdGenerator = exports.radToDeg = exports.degToRad = exports.getColorFromVariant = exports.clamp = exports.compareByValueAsc = exports.VerticalAlignment = exports.HorizontalAlignment = exports.ColorVariant = exports.LayoutDirection = exports.Position = void 0;
var react_1 = __importStar(require("react"));
var utility_types_1 = require("utility-types");
var uuid_1 = require("uuid");
var colors_1 = require("../common/colors");
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
var degToRad = function (angle) { return (angle / 180) * Math.PI; };
exports.degToRad = degToRad;
var radToDeg = function (radian) { return (radian * 180) / Math.PI; };
exports.radToDeg = radToDeg;
function htmlIdGenerator(idPrefix) {
    var prefix = idPrefix || "i".concat((0, uuid_1.v1)());
    return function (suffix) { return "".concat(prefix, "_").concat(suffix || (0, uuid_1.v1)()); };
}
exports.htmlIdGenerator = htmlIdGenerator;
function getPartialValue(base, partial, partials) {
    if (partials === void 0) { partials = []; }
    var partialWithValue = partial !== undefined ? partial : partials.find(function (v) { return v !== undefined; });
    return partialWithValue !== undefined ? partialWithValue : base;
}
exports.getPartialValue = getPartialValue;
function getAllKeys(object, objects) {
    if (objects === void 0) { objects = []; }
    return new Set(__spreadArray([object], __read(objects), false).filter(Boolean).reduce(function (keys, obj) {
        if (obj && typeof obj === 'object') {
            var newKeys = obj ? (obj instanceof Map ? obj.keys() : Object.keys(obj)) : [];
            keys.push.apply(keys, __spreadArray([], __read(newKeys), false));
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
function hasPartialObjectToMerge(base, partial, additionalPartials) {
    if (additionalPartials === void 0) { additionalPartials = []; }
    if (isArrayOrSet(base)) {
        return false;
    }
    if (typeof base === 'object' && base !== null) {
        if (typeof partial === 'object' && !isArrayOrSet(partial) && partial !== null) {
            return true;
        }
        return additionalPartials.some(function (p) { return typeof p === 'object' && !Array.isArray(p); });
    }
    return false;
}
exports.hasPartialObjectToMerge = hasPartialObjectToMerge;
function shallowClone(value) {
    if (Array.isArray(value)) {
        return __spreadArray([], __read(value), false);
    }
    if (value instanceof Set) {
        return new Set(value);
    }
    if (typeof value === 'object' && value !== null) {
        if (value instanceof Map) {
            return new Map(value.entries());
        }
        return __assign({}, value);
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
    return (function () { return react_1.default.createElement(react_1.default.Fragment, null, children); })();
}
exports.renderComplexChildren = renderComplexChildren;
function mergePartial(base, partial, options, additionalPartials) {
    var _a;
    if (options === void 0) { options = {}; }
    if (additionalPartials === void 0) { additionalPartials = []; }
    var baseClone = shallowClone(base);
    if (hasPartialObjectToMerge(base, partial, additionalPartials)) {
        var mapCondition = !(baseClone instanceof Map) || options.mergeMaps;
        var partialKeys = getAllKeys(partial, additionalPartials);
        if (partialKeys.size > 0 && ((_a = options.mergeOptionalPartialValues) !== null && _a !== void 0 ? _a : true) && mapCondition) {
            partialKeys.forEach(function (key) {
                var _a;
                if (baseClone instanceof Map) {
                    if (!baseClone.has(key)) {
                        baseClone.set(key, partial.get(key) !== undefined
                            ? partial.get(key)
                            : additionalPartials.find(function (v) { return v.get(key) !== undefined; }) || new Map().get(key));
                    }
                }
                else if (!(key in baseClone)) {
                    baseClone[key] =
                        (partial === null || partial === void 0 ? void 0 : partial[key]) !== undefined
                            ? partial[key]
                            : ((_a = additionalPartials.find(function (v) { return (v === null || v === void 0 ? void 0 : v[key]) !== undefined; })) !== null && _a !== void 0 ? _a : {})[key];
                }
            });
        }
        if (baseClone instanceof Map) {
            if (options.mergeMaps) {
                return __spreadArray([], __read(baseClone.keys()), false).reduce(function (newBase, key) {
                    var partialValue = partial && partial.get(key);
                    var partialValues = additionalPartials.map(function (v) {
                        return typeof v === 'object' && v instanceof Map ? v.get(key) : undefined;
                    });
                    var baseValue = base.get(key);
                    newBase.set(key, mergePartial(baseValue, partialValue, options, partialValues));
                    return newBase;
                }, baseClone);
            }
            if (partial !== undefined) {
                return partial;
            }
            var additional = additionalPartials.find(function (p) { return p !== undefined; });
            if (additional) {
                return additional;
            }
            return baseClone;
        }
        return Object.keys(baseClone).reduce(function (newBase, key) {
            var partialValue = partial && partial[key];
            var partialValues = additionalPartials.map(function (v) { return (typeof v === 'object' ? v[key] : undefined); });
            var baseValue = base[key];
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
    var values = new Set();
    return (function isUniqueArrayFn() {
        return arr.every(function (v) {
            var value = extractor ? extractor(v) : v;
            if (values.has(value)) {
                return false;
            }
            values.add(value);
            return true;
        });
    })();
}
exports.isUniqueArray = isUniqueArray;
function isRTLString(s, ratio) {
    if (ratio === void 0) { ratio = 0.5; }
    var stripped = s.replace(/[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]|\s|\d/gi, '');
    return stripped.length / s.replace(/\s|\d/gi, '').length < ratio;
}
exports.isRTLString = isRTLString;
function hasMostlyRTLItems(items, ratio) {
    if (ratio === void 0) { ratio = 0.5; }
    var filteredItems = items.filter(Boolean);
    var rtlItemCount = filteredItems.filter(function (s) { return isRTLString(s); }).length;
    return rtlItemCount / filteredItems.length > ratio;
}
exports.hasMostlyRTLItems = hasMostlyRTLItems;
function isDefined(value) {
    return value !== null && value !== undefined;
}
exports.isDefined = isDefined;
function isDefinedFrom(typeCheck) {
    return function (value) {
        if (value === undefined) {
            return false;
        }
        try {
            return typeCheck(value);
        }
        catch (_a) {
            return false;
        }
    };
}
exports.isDefinedFrom = isDefinedFrom;
var round = function (value, fractionDigits) {
    if (fractionDigits === void 0) { fractionDigits = 0; }
    var precision = Math.pow(10, Math.max(fractionDigits, 0));
    var scaledValue = Math.floor(value * precision);
    return scaledValue / precision;
};
exports.round = round;
function getPercentageValue(ratio, relativeValue, defaultValue) {
    if (typeof ratio === 'number') {
        return Math.abs(ratio);
    }
    var ratioStr = ratio.trim();
    if (/\d+%$/.test(ratioStr)) {
        var percentage = Math.abs(Number.parseInt(ratioStr.slice(0, -1), 10));
        return relativeValue * (percentage / 100);
    }
    var num = Number.parseFloat(ratioStr);
    return Number.isFinite(num) ? Math.abs(num) : defaultValue;
}
exports.getPercentageValue = getPercentageValue;
function keepDistinct(d, i, a) {
    return a.indexOf(d) === i;
}
exports.keepDistinct = keepDistinct;
function toEntries(array, accessor, staticValue) {
    return array.reduce(function (acc, curr) {
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
        catch (_a) {
        }
    }
    return "".concat(value);
}
exports.safeFormat = safeFormat;
var range = function (from, to, step) {
    return Array.from({ length: Math.abs(Math.round((to - from) / (step || 1))) }, function (_, i) { return from + i * step; });
};
exports.range = range;
var oppositeAlignmentMap = (_a = {},
    _a[exports.HorizontalAlignment.Left] = exports.HorizontalAlignment.Right,
    _a[exports.HorizontalAlignment.Right] = exports.HorizontalAlignment.Left,
    _a[exports.VerticalAlignment.Top] = exports.VerticalAlignment.Bottom,
    _a[exports.VerticalAlignment.Bottom] = exports.VerticalAlignment.Top,
    _a);
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
    return Object.keys(source).reduce(function (acc, key) {
        var val = source[key];
        if (val !== undefined) {
            acc[key] = val;
        }
        return acc;
    }, {});
}
exports.stripUndefined = stripUndefined;
var isBetween = function (min, max, exclusive) {
    if (exclusive === void 0) { exclusive = false; }
    return exclusive ? function (n) { return n < max && n > min; } : function (n) { return n <= max && n >= min; };
};
exports.isBetween = isBetween;
var clampAll = function (min, max) {
    var seen = new Set();
    return [
        function (acc, n) {
            var clampValue = clamp(n, min, max);
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