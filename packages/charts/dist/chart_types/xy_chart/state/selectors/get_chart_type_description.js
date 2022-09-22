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
exports.getChartTypeDescriptionSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_specs_1 = require("./get_specs");
exports.getChartTypeDescriptionSelector = (0, create_selector_1.createCustomCachedSelector)([get_specs_1.getSeriesSpecsSelector], function (specs) {
    var seriesTypes = new Set();
    specs.forEach(function (value) { return seriesTypes.add(value.seriesType); });
    return seriesTypes.size > 1 ? "Mixed chart: ".concat(__spreadArray([], __read(seriesTypes), false).join(' and '), " chart") : "".concat(__spreadArray([], __read(seriesTypes), false), " chart");
});
//# sourceMappingURL=get_chart_type_description.js.map