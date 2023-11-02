"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainTween = void 0;
const math_1 = require("../utils/math");
const REFERENCE_AF_LENGTH = 16.67;
const REFERENCE_Y_RECURRENCE_ALPHA = 0.1;
const TWEEN_DONE_EPSILON = 0.001;
const domainTween = (interactionState, deltaT, targetMin, targetMax) => {
    const { niceDomainMin: currentMin, niceDomainMax: currentMax } = interactionState;
    const speedExp = Math.pow((currentMax - currentMin) / (targetMax - targetMin), 0.2);
    const advance = 1 - (1 - REFERENCE_Y_RECURRENCE_ALPHA) ** ((speedExp * deltaT) / REFERENCE_AF_LENGTH);
    const min = Number.isFinite(currentMin) ? (0, math_1.mix)(currentMin, targetMin, advance) : targetMin;
    const max = Number.isFinite(currentMax) ? (0, math_1.mix)(currentMax, targetMax, advance) : targetMax;
    const tweenIncomplete = Math.abs(1 - (max - min) / (targetMax - targetMin)) > TWEEN_DONE_EPSILON;
    interactionState.niceDomainMin = min;
    interactionState.niceDomainMax = max;
    return tweenIncomplete;
};
exports.domainTween = domainTween;
//# sourceMappingURL=domain_tween.js.map