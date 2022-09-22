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
exports.DataGenerator = void 0;
var simple_noise_1 = require("./simple_noise");
function defaultRNG(min, max, fractionDigits, inclusive) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 1; }
    if (fractionDigits === void 0) { fractionDigits = 0; }
    if (inclusive === void 0) { inclusive = true; }
    var precision = Math.pow(10, Math.max(fractionDigits, 0));
    var scaledMax = max * precision;
    var scaledMin = min * precision;
    var offset = inclusive ? 1 : 0;
    var num = Math.floor(Math.random() * (scaledMax - scaledMin + offset)) + scaledMin;
    return num / precision;
}
var DataGenerator = (function () {
    function DataGenerator(frequency, randomNumberGenerator) {
        if (frequency === void 0) { frequency = 500; }
        if (randomNumberGenerator === void 0) { randomNumberGenerator = defaultRNG; }
        this.randomNumberGenerator = randomNumberGenerator;
        this.generator = new simple_noise_1.Simple1DNoise(this.randomNumberGenerator);
        this.frequency = frequency;
    }
    DataGenerator.prototype.generateBasicSeries = function (totalPoints, offset, amplitude) {
        var _this = this;
        if (totalPoints === void 0) { totalPoints = 50; }
        if (offset === void 0) { offset = 0; }
        if (amplitude === void 0) { amplitude = 1; }
        var dataPoints = new Array(totalPoints).fill(0).map(function (_, i) { return ({
            x: i,
            y: (_this.generator.getValue(i) + offset) * amplitude,
        }); });
        return dataPoints;
    };
    DataGenerator.prototype.generateSimpleSeries = function (totalPoints, groupIndex, groupPrefix) {
        var _this = this;
        if (totalPoints === void 0) { totalPoints = 50; }
        if (groupIndex === void 0) { groupIndex = 1; }
        if (groupPrefix === void 0) { groupPrefix = ''; }
        var group = String.fromCharCode(97 + groupIndex);
        var dataPoints = new Array(totalPoints).fill(0).map(function (_, i) { return ({
            x: i,
            y: 3 + Math.sin(i / _this.frequency) + _this.generator.getValue(i),
            g: "".concat(groupPrefix).concat(group),
        }); });
        return dataPoints;
    };
    DataGenerator.prototype.generateGroupedSeries = function (totalPoints, totalGroups, groupPrefix) {
        var _this = this;
        if (totalPoints === void 0) { totalPoints = 50; }
        if (totalGroups === void 0) { totalGroups = 2; }
        if (groupPrefix === void 0) { groupPrefix = ''; }
        var groups = new Array(totalGroups)
            .fill(0)
            .map(function (group, i) { return _this.generateSimpleSeries(totalPoints, i, groupPrefix); });
        return groups.reduce(function (acc, curr) { return __spreadArray(__spreadArray([], __read(acc), false), __read(curr), false); });
    };
    DataGenerator.prototype.generateRandomSeries = function (totalPoints, groupIndex, groupPrefix) {
        var _this = this;
        if (totalPoints === void 0) { totalPoints = 50; }
        if (groupIndex === void 0) { groupIndex = 1; }
        if (groupPrefix === void 0) { groupPrefix = ''; }
        var group = String.fromCharCode(97 + groupIndex);
        var dataPoints = new Array(totalPoints).fill(0).map(function () { return ({
            x: _this.randomNumberGenerator(0, 100),
            y: _this.randomNumberGenerator(0, 100),
            z: _this.randomNumberGenerator(0, 100),
            g: "".concat(groupPrefix).concat(group),
        }); });
        return dataPoints;
    };
    DataGenerator.prototype.generateRandomGroupedSeries = function (totalPoints, totalGroups, groupPrefix) {
        var _this = this;
        if (totalPoints === void 0) { totalPoints = 50; }
        if (totalGroups === void 0) { totalGroups = 2; }
        if (groupPrefix === void 0) { groupPrefix = ''; }
        var groups = new Array(totalGroups)
            .fill(0)
            .map(function (group, i) { return _this.generateRandomSeries(totalPoints, i, groupPrefix); });
        return groups.reduce(function (acc, curr) { return __spreadArray(__spreadArray([], __read(acc), false), __read(curr), false); });
    };
    return DataGenerator;
}());
exports.DataGenerator = DataGenerator;
//# sourceMappingURL=data_generator.js.map