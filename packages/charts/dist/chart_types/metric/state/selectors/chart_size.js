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
Object.defineProperty(exports, "__esModule", { value: true });
exports.chartSize = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var getParentDimension = function (state) { return state.parentDimensions; };
exports.chartSize = (0, create_selector_1.createCustomCachedSelector)([getParentDimension], function (container) {
    return __assign({}, container);
});
//# sourceMappingURL=chart_size.js.map