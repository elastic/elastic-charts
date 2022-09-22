"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observe = exports.toCallbackFn = void 0;
var toCallbackFn = function (generatorObject) {
    generatorObject.next();
    return function (event) { return generatorObject.next(event); };
};
exports.toCallbackFn = toCallbackFn;
var observe = function (eventTarget, commonHandler, handlers) {
    for (var eventName in handlers)
        eventTarget.addEventListener(eventName, commonHandler, { passive: false });
    return function () {
        for (var eventName in handlers)
            eventTarget.removeEventListener(eventName, commonHandler);
    };
};
exports.observe = observe;
//# sourceMappingURL=generator.js.map