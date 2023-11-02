"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataGenerator = void 0;
const simple_noise_1 = require("./simple_noise");
function defaultRNG(min = 0, max = 1, fractionDigits = 0, inclusive = true) {
    const precision = Math.pow(10, Math.max(fractionDigits, 0));
    const scaledMax = max * precision;
    const scaledMin = min * precision;
    const offset = inclusive ? 1 : 0;
    const num = Math.floor(Math.random() * (scaledMax - scaledMin + offset)) + scaledMin;
    return num / precision;
}
const fillGroups = (n) => new Array(Math.max(n, 1)).fill(0).map((_, i) => String.fromCharCode(97 + i));
class DataGenerator {
    constructor(frequency = 500, randomNumberGenerator = defaultRNG) {
        this.randomNumberGenerator = randomNumberGenerator;
        this.generator = new simple_noise_1.Simple1DNoise(this.randomNumberGenerator);
        this.frequency = frequency;
    }
    generateBasicSeries(totalPoints = 50, offset = 0, amplitude = 1) {
        const dataPoints = new Array(totalPoints).fill(0).map((_, i) => ({
            x: i,
            y: (this.generator.getValue(i) + offset) * amplitude,
        }));
        return dataPoints;
    }
    generateSimpleSeries(totalPoints = 50, groupIndex = 1, groupPrefix = '') {
        const group = String.fromCharCode(97 + groupIndex);
        const dataPoints = new Array(totalPoints).fill(0).map((_, i) => ({
            x: i,
            y: 3 + Math.sin(i / this.frequency) + this.generator.getValue(i),
            g: `${groupPrefix}${group}`,
        }));
        return dataPoints;
    }
    generateGroupedSeries(totalPoints = 50, totalGroups = 2, groupPrefix = '') {
        const groups = new Array(totalGroups).fill(0).map((_, i) => this.generateSimpleSeries(totalPoints, i, groupPrefix));
        return groups.reduce((acc, curr) => [...acc, ...curr]);
    }
    generateRandomSeries(totalPoints = 50, groupIndex = 1, groupPrefix = '') {
        const group = String.fromCharCode(97 + groupIndex);
        const dataPoints = new Array(totalPoints).fill(0).map(() => ({
            x: this.randomNumberGenerator(0, 100),
            y: this.randomNumberGenerator(0, 100),
            z: this.randomNumberGenerator(0, 100),
            g: `${groupPrefix}${group}`,
        }));
        return dataPoints;
    }
    generateRandomGroupedSeries(totalPoints = 50, totalGroups = 2, groupPrefix = '') {
        const groups = new Array(totalGroups).fill(0).map((_, i) => this.generateRandomSeries(totalPoints, i, groupPrefix));
        return groups.reduce((acc, curr) => [...acc, ...curr]);
    }
    generateSMGroupedSeries(verticalGroups, horizontalGroups, seriesGenerator) {
        const vGroups = typeof verticalGroups === 'number' ? fillGroups(verticalGroups) : verticalGroups;
        const hGroups = typeof horizontalGroups === 'number' ? fillGroups(horizontalGroups) : horizontalGroups;
        return vGroups.flatMap((v) => {
            return hGroups.flatMap((h) => {
                return seriesGenerator(h, v).map((row) => ({
                    h,
                    v,
                    ...row,
                }));
            });
        });
    }
}
exports.DataGenerator = DataGenerator;
//# sourceMappingURL=data_generator.js.map