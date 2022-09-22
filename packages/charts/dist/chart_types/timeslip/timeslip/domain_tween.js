"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainTween = void 0;
var math_1 = require("./utils/math");
var REFERENCE_AF_LENGTH = 16.67;
var REFERENCE_Y_RECURRENCE_ALPHA = 0.1;
var TWEEN_DONE_EPSILON = 0.001;
var domainTween = function (interactionState, deltaT, targetMin, targetMax) {
    var currentMin = interactionState.niceDomainMin, currentMax = interactionState.niceDomainMax;
    var speedExp = Math.pow((currentMax - currentMin) / (targetMax - targetMin), 0.2);
    var advance = 1 - Math.pow((1 - REFERENCE_Y_RECURRENCE_ALPHA), ((speedExp * deltaT) / REFERENCE_AF_LENGTH));
    var min = Number.isFinite(currentMin) ? (0, math_1.mix)(currentMin, targetMin, advance) : targetMin;
    var max = Number.isFinite(currentMax) ? (0, math_1.mix)(currentMax, targetMax, advance) : targetMax;
    var tweenIncomplete = Math.abs(1 - (max - min) / (targetMax - targetMin)) > TWEEN_DONE_EPSILON;
    interactionState.niceDomainMin = min;
    interactionState.niceDomainMax = max;
    return tweenIncomplete;
};
exports.domainTween = domainTween;
//# sourceMappingURL=domain_tween.js.map