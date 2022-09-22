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
exports.Logger = void 0;
var Logger = (function () {
    function Logger() {
    }
    Logger.warn = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (Logger.isDevelopment() && !Logger.isTest()) {
            console.warn.apply(console, __spreadArray(["".concat(Logger.namespace, " ").concat(message)], __read(optionalParams), false));
        }
    };
    Logger.expected = function (message, expected, received) {
        if (Logger.isDevelopment() && !Logger.isTest()) {
            console.warn("".concat(Logger.namespace, " ").concat(message), "\n\n  Expected: ".concat(expected, "\n  Received: ").concat(received, "\n"));
        }
    };
    Logger.error = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (Logger.isDevelopment() && !Logger.isTest()) {
            console.error.apply(console, __spreadArray(["".concat(Logger.namespace, " ").concat(message)], __read(optionalParams), false));
        }
    };
    Logger.isDevelopment = function () {
        return process.env.NODE_ENV !== 'production';
    };
    Logger.isTest = function () {
        return process.env.NODE_ENV === 'test';
    };
    Logger.namespace = '[@elastic/charts]';
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map