"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnimationPoolFn = void 0;
const logger_1 = require("./../../../../../utils/logger");
const animation_1 = require("./animation");
const debounce_1 = require("../../../../../utils/debounce");
const DISABLE_ANIMATIONS = (typeof process === 'object' && process.env && process.env.VRT) === 'true';
const getAnimationPoolFn = (animationState, renderFn) => {
    window.cancelAnimationFrame(animationState.rafId);
    animationState.pool.forEach((a) => a.clear());
    return (0, debounce_1.debounce)(function getAnimationPoolFnDebounce() {
        const propValuesForRun = new Map();
        const getAnimatedValueFn = (t) => (options) => (key, value) => {
            var _a;
            if (t === 0 && propValuesForRun.has(key) && propValuesForRun.get(key) !== value) {
                logger_1.Logger.error(`aCtx.getValue(\`${key}\`, <value>) was called multiple times in a single render with different values.\
 Please animate these values independently to avoid collisions.`);
            }
            if (DISABLE_ANIMATIONS || !((_a = options === null || options === void 0 ? void 0 : options.enabled) !== null && _a !== void 0 ? _a : true))
                return value;
            propValuesForRun.set(key, value);
            if (!animationState.pool.has(key)) {
                animationState.pool.set(key, new animation_1.Animation(value, options));
            }
            const animation = animationState.pool.get(key);
            if (!animation)
                return value;
            animation.setTarget(value);
            return animation.valueAtTime(t);
        };
        function getAnimationContext(t) {
            return {
                getValue: getAnimatedValueFn(t),
            };
        }
        renderFn(getAnimationContext(0));
        animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
            const anim = (t) => {
                const elapsed = t - epochStartTime;
                const animations = [...animationState.pool.values()];
                if (!animations.every((a) => a.isDelayed(elapsed))) {
                    renderFn(getAnimationContext(elapsed));
                }
                if (animations.some((a) => a.isActive(elapsed))) {
                    animationState.rafId = window.requestAnimationFrame(anim);
                }
            };
            animationState.rafId = window.requestAnimationFrame(anim);
        });
    }, 300, { isImmediate: true })();
};
exports.getAnimationPoolFn = getAnimationPoolFn;
//# sourceMappingURL=index.js.map