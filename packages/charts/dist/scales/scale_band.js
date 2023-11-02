"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaleBand = void 0;
const d3_scale_1 = require("d3-scale");
const constants_1 = require("./constants");
const common_1 = require("../utils/common");
class ScaleBand {
    constructor(inputDomain, range, overrideBandwidth, barsPadding = 0) {
        const isObjectPad = typeof barsPadding === 'object';
        const safeBarPadding = isObjectPad ? 0 : (0, common_1.clamp)(barsPadding, 0, 1);
        this.type = constants_1.ScaleType.Ordinal;
        const d3Scale = (0, d3_scale_1.scaleBand)()
            .domain(inputDomain.length > 0 ? inputDomain : [undefined])
            .range(range)
            .paddingInner(isObjectPad ? barsPadding.inner : safeBarPadding)
            .paddingOuter(isObjectPad ? barsPadding.outer : safeBarPadding / 2);
        this.barsPadding = isObjectPad ? barsPadding.inner : safeBarPadding;
        this.outerPadding = d3Scale.paddingOuter();
        this.innerPadding = d3Scale.paddingInner();
        this.bandwidth = overrideBandwidth ? overrideBandwidth * (1 - safeBarPadding) : d3Scale.bandwidth() || 0;
        this.originalBandwidth = d3Scale.bandwidth() || 0;
        this.step = d3Scale.step();
        this.domain = (inputDomain.length > 0 ? [...new Set(inputDomain)] : [undefined]);
        this.range = [range[0], range[1]];
        this.bandwidthPadding = this.bandwidth;
        const invertedScale = (0, d3_scale_1.scaleQuantize)()
            .domain(range)
            .range(inputDomain.length > 0 ? [...new Set(inputDomain)] : [undefined]);
        this.minInterval = 0;
        this.project = (d) => { var _a; return (_a = d3Scale(d)) !== null && _a !== void 0 ? _a : NaN; };
        this.inverseProject = (d) => invertedScale(d);
    }
    scale(value) {
        return this.project(value);
    }
    pureScale(value) {
        return this.scale(value);
    }
    ticks() {
        return this.domain;
    }
    invert(value) {
        return this.inverseProject(value);
    }
    invertWithStep(value) {
        return {
            withinBandwidth: true,
            value: this.inverseProject(value),
        };
    }
    isSingleValue() {
        return this.domain.length < 2;
    }
    isValueInDomain(value) {
        return this.domain.includes(value);
    }
}
exports.ScaleBand = ScaleBand;
//# sourceMappingURL=scale_band.js.map