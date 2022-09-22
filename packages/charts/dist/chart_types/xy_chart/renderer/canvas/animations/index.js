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
exports.getAnimationPoolFn = void 0;
var debounce_1 = require("../../../../../utils/debounce");
var logger_1 = require("./../../../../../utils/logger");
var animation_1 = require("./animation");
var DISABLE_ANIMATIONS = (typeof process === 'object' && process.env && process.env.VRT) === 'true';
var getAnimationPoolFn = function (animationState, renderFn) {
    window.cancelAnimationFrame(animationState.rafId);
    animationState.pool.forEach(function (a) { return a.clear(); });
    return (0, debounce_1.debounce)(function getAnimationPoolFnDebounce() {
        var propValuesForRun = new Map();
        var getAnimatedValueFn = function (t) {
            return function (options) {
                return function (key, value) {
                    var _a;
                    if (t === 0 && propValuesForRun.has(key) && propValuesForRun.get(key) !== value) {
                        logger_1.Logger.error("aCtx.getValue(`".concat(key, "`, <value>) was called multiple times in a single render with different values. Please animate these values independently to avoid collisions."));
                    }
                    if (DISABLE_ANIMATIONS || !((_a = options === null || options === void 0 ? void 0 : options.enabled) !== null && _a !== void 0 ? _a : true))
                        return value;
                    propValuesForRun.set(key, value);
                    if (!animationState.pool.has(key)) {
                        animationState.pool.set(key, new animation_1.Animation(value, options));
                    }
                    var animation = animationState.pool.get(key);
                    if (!animation)
                        return value;
                    animation.setTarget(value);
                    return animation.valueAtTime(t);
                };
            };
        };
        function getAnimationContext(t) {
            return {
                getValue: getAnimatedValueFn(t),
            };
        }
        renderFn(getAnimationContext(0));
        animationState.rafId = window.requestAnimationFrame(function (epochStartTime) {
            var anim = function (t) {
                var elapsed = t - epochStartTime;
                var animations = __spreadArray([], __read(animationState.pool.values()), false);
                if (!animations.every(function (a) { return a.isDelayed(elapsed); })) {
                    renderFn(getAnimationContext(elapsed));
                }
                if (animations.some(function (a) { return a.isActive(elapsed); })) {
                    animationState.rafId = window.requestAnimationFrame(anim);
                }
            };
            animationState.rafId = window.requestAnimationFrame(anim);
        });
    }, 300, { isImmediate: true })();
};
exports.getAnimationPoolFn = getAnimationPoolFn;
//# sourceMappingURL=index.js.map