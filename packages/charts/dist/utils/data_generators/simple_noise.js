"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simple1DNoise = void 0;
class Simple1DNoise {
    constructor(randomNumberGenerator, maxVertices = 256, amplitude = 5.1, scale = 0.6) {
        this.getRandomNumber = randomNumberGenerator;
        this.maxVerticesMask = maxVertices - 1;
        this.amplitude = amplitude;
        this.scale = scale;
        this.maxVertices = maxVertices;
    }
    getValue(x) {
        var _a, _b;
        const r = new Array(this.maxVertices).fill(0).map(() => this.getRandomNumber(0, 1, 5, true));
        const scaledX = x * this.scale;
        const xFloor = Math.floor(scaledX);
        const t = scaledX - xFloor;
        const tRemapSmoothstep = t * t * (3 - 2 * t);
        const xMin = xFloor & this.maxVerticesMask;
        const xMax = (xMin + 1) & this.maxVerticesMask;
        const y = this.lerp((_a = r[xMin]) !== null && _a !== void 0 ? _a : 0, (_b = r[xMax]) !== null && _b !== void 0 ? _b : 0, tRemapSmoothstep);
        return y * this.amplitude;
    }
    lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }
}
exports.Simple1DNoise = Simple1DNoise;
//# sourceMappingURL=simple_noise.js.map