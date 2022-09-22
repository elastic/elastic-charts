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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerPanelMap = void 0;
function getPerPanelMap(scales, fn) {
    var horizontal = scales.horizontal, vertical = scales.vertical;
    return vertical.domain.reduce(function (acc, verticalValue) {
        return __spreadArray(__spreadArray([], __read(acc), false), __read(horizontal.domain.reduce(function (hAcc, horizontalValue) {
            var panelAnchor = {
                x: horizontal.scale(horizontalValue) || 0,
                y: vertical.scale(verticalValue) || 0,
            };
            var fnObj = fn(panelAnchor, horizontalValue, verticalValue, scales);
            return fnObj ? __spreadArray(__spreadArray([], __read(hAcc), false), [__assign({ panelAnchor: panelAnchor, horizontalValue: horizontalValue, verticalValue: verticalValue }, fnObj)], false) : hAcc;
        }, [])), false);
    }, []);
}
exports.getPerPanelMap = getPerPanelMap;
//# sourceMappingURL=panel_utils.js.map