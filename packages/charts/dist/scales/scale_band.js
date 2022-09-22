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
exports.ScaleBand = void 0;
var d3_scale_1 = require("d3-scale");
var common_1 = require("../utils/common");
var constants_1 = require("./constants");
var ScaleBand = (function () {
    function ScaleBand(inputDomain, range, overrideBandwidth, barsPadding) {
        if (barsPadding === void 0) { barsPadding = 0; }
        var isObjectPad = typeof barsPadding === 'object';
        var safeBarPadding = isObjectPad ? 0 : (0, common_1.clamp)(barsPadding, 0, 1);
        this.type = constants_1.ScaleType.Ordinal;
        var d3Scale = (0, d3_scale_1.scaleBand)()
            .domain(inputDomain.length > 0 ? inputDomain : [undefined])
            .range(range)
            .paddingInner(isObjectPad ? barsPadding.inner : safeBarPadding)
            .paddingOuter(isObjectPad ? barsPadding.outer : safeBarPadding / 2);
        this.barsPadding = isObjectPad ? barsPadding.inner : safeBarPadding;
        this.outerPadding = d3Scale.paddingOuter();
        this.innerPadding = d3Scale.paddingInner();
        this.bandwidth = overrideBandwidth ? overrideBandwidth * (1 - safeBarPadding) : d3Scale.bandwidth() || 0;
        this.originalBandwidth = d3Scale.bandwidth() || 0;
        this.step = d3Scale.step();
        this.domain = (inputDomain.length > 0 ? __spreadArray([], __read(new Set(inputDomain)), false) : [undefined]);
        this.range = range.slice();
        this.bandwidthPadding = this.bandwidth;
        var invertedScale = (0, d3_scale_1.scaleQuantize)()
            .domain(range)
            .range(inputDomain.length > 0 ? __spreadArray([], __read(new Set(inputDomain)), false) : [undefined]);
        this.minInterval = 0;
        this.project = function (d) { var _a; return (_a = d3Scale(d)) !== null && _a !== void 0 ? _a : NaN; };
        this.inverseProject = function (d) { return invertedScale(d); };
    }
    ScaleBand.prototype.scale = function (value) {
        return this.project(value);
    };
    ScaleBand.prototype.pureScale = function (value) {
        return this.scale(value);
    };
    ScaleBand.prototype.ticks = function () {
        return this.domain;
    };
    ScaleBand.prototype.invert = function (value) {
        return this.inverseProject(value);
    };
    ScaleBand.prototype.invertWithStep = function (value) {
        return {
            withinBandwidth: true,
            value: this.inverseProject(value),
        };
    };
    ScaleBand.prototype.isSingleValue = function () {
        return this.domain.length < 2;
    };
    ScaleBand.prototype.isValueInDomain = function (value) {
        return this.domain.includes(value);
    };
    return ScaleBand;
}());
exports.ScaleBand = ScaleBand;
//# sourceMappingURL=scale_band.js.map