"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Animation = exports.AnimationSpeed = void 0;
var common_1 = require("../../../../../utils/common");
var time_functions_1 = require("./../../../../../utils/time_functions");
exports.AnimationSpeed = Object.freeze({
    extraFast: 90,
    fast: 150,
    normal: 250,
    slow: 350,
    extraSlow: 500,
});
var Animation = (function () {
    function Animation(value, options) {
        if (options === void 0) { options = {}; }
        var _a, _b, _c, _d, _e, _f;
        this.timingFn = time_functions_1.TimingFunctions.linear;
        this.initial = (_a = options === null || options === void 0 ? void 0 : options.initialValue) !== null && _a !== void 0 ? _a : value;
        this.current = (_b = options === null || options === void 0 ? void 0 : options.initialValue) !== null && _b !== void 0 ? _b : value;
        this.target = value;
        this.previousTarget = value;
        this.timeOffset = 0;
        this.delay = (_c = (typeof (options === null || options === void 0 ? void 0 : options.delay) === 'string' ? exports.AnimationSpeed[options.delay] : options === null || options === void 0 ? void 0 : options.delay)) !== null && _c !== void 0 ? _c : 0;
        this.duration =
            typeof (options === null || options === void 0 ? void 0 : options.duration) === 'string'
                ? exports.AnimationSpeed[options.duration]
                : (_d = options === null || options === void 0 ? void 0 : options.duration) !== null && _d !== void 0 ? _d : exports.AnimationSpeed.slow;
        this.timeFunction = (_e = options === null || options === void 0 ? void 0 : options.timeFunction) !== null && _e !== void 0 ? _e : time_functions_1.TimeFunction.linear;
        this.snapValues = (_f = options === null || options === void 0 ? void 0 : options.snapValues) !== null && _f !== void 0 ? _f : [];
        this.setTimingFn();
    }
    Animation.prototype.isDelayed = function (t) {
        if (this.timeOffset !== 0)
            return false;
        return t < this.delay;
    };
    Animation.prototype.isActive = function (t) {
        if (!(0, common_1.isFiniteNumber)(this.initial) || !(0, common_1.isFiniteNumber)(this.target) || this.initial === this.target) {
            return false;
        }
        return t - this.delay + this.timeOffset < this.duration;
    };
    Animation.prototype.setTarget = function (value) {
        if (this.snapValues.includes(value)) {
            this.current = value;
            this.clear();
        }
        else if (this.target !== value) {
            if (this.previousTarget) {
                this.initial = this.previousTarget;
                this.target = value;
                this.setTimingFn();
                this.timeOffset = this.invertTimingFn();
            }
            else {
                this.timeOffset = 0;
                this.initial = this.current;
                this.target = value;
                this.setTimingFn();
            }
        }
    };
    Animation.prototype.invertTimingFn = function () {
        var scaledValue = this.current - this.initial;
        var scalar = this.target - this.initial;
        var multiplier = scaledValue / scalar;
        var timeDelta = (0, common_1.clamp)(time_functions_1.TimingFunctions[this.timeFunction].inverse(multiplier), 0, 1);
        return timeDelta * this.duration + this.delay;
    };
    Animation.prototype.setTimingFn = function () {
        var _this = this;
        var scalar = this.target - this.initial;
        this.timingFn =
            scalar === 0
                ? function () { return _this.initial; }
                : function (t) {
                    var multiplier = time_functions_1.TimingFunctions[_this.timeFunction](t);
                    return _this.initial + scalar * multiplier;
                };
    };
    Animation.prototype.valueAtTime = function (t) {
        if (this.isDelayed(t))
            return this.initial;
        var unitNormalizedTime = Math.max(0, Math.min(1, (t - this.delay + this.timeOffset) / this.duration));
        var value = this.timingFn(unitNormalizedTime);
        this.current = value;
        return value;
    };
    Animation.prototype.clear = function () {
        this.previousTarget = this.current === this.target ? null : this.target;
        this.initial = this.current;
        this.target = this.current;
        this.setTimingFn();
    };
    return Animation;
}());
exports.Animation = Animation;
//# sourceMappingURL=animation.js.map