"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withDeltaTime = exports.withAnimation = void 0;
const withAnimation = (renderer) => {
    let rAF = -1;
    return () => {
        window.cancelAnimationFrame(rAF);
        rAF = window.requestAnimationFrame(renderer);
    };
};
exports.withAnimation = withAnimation;
const withDeltaTime = (renderer) => {
    let prevT = 0;
    return (t) => {
        const deltaT = t - prevT;
        prevT = t;
        renderer(deltaT);
    };
};
exports.withDeltaTime = withDeltaTime;
//# sourceMappingURL=animation.js.map