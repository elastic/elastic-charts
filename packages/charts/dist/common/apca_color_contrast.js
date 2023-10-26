"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APCAContrast = void 0;
function APCAContrast([Rbg, Gbg, Bbg], [Rtxt, Gtxt, Btxt]) {
    const mainTRC = 2.4;
    const Rco = 0.2126729;
    const Gco = 0.7151522;
    const Bco = 0.072175;
    const normBG = 0.56;
    const normTXT = 0.57;
    const revTXT = 0.62;
    const revBG = 0.65;
    const blkThrs = 0.022;
    const blkClmp = 1.414;
    const deltaYmin = 0.0005;
    const scaleBoW = 1.14;
    const scaleWoB = 1.14;
    const loConThresh = 0.035991;
    const loConFactor = 27.7847239587675;
    const loConOffset = 0.027;
    const loClip = 0.001;
    let Ybg = Math.pow(Rbg / 255.0, mainTRC) * Rco + Math.pow(Gbg / 255.0, mainTRC) * Gco + Math.pow(Bbg / 255.0, mainTRC) * Bco;
    let Ytxt = Math.pow(Rtxt / 255.0, mainTRC) * Rco +
        Math.pow(Gtxt / 255.0, mainTRC) * Gco +
        Math.pow(Btxt / 255.0, mainTRC) * Bco;
    let SAPC = 0.0;
    let outputContrast = 0.0;
    Ytxt = Ytxt > blkThrs ? Ytxt : Ytxt + Math.pow(blkThrs - Ytxt, blkClmp);
    Ybg = Ybg > blkThrs ? Ybg : Ybg + Math.pow(blkThrs - Ybg, blkClmp);
    if (Math.abs(Ybg - Ytxt) < deltaYmin) {
        return 0.0;
    }
    if (Ybg > Ytxt) {
        SAPC = (Math.pow(Ybg, normBG) - Math.pow(Ytxt, normTXT)) * scaleBoW;
        outputContrast =
            SAPC < loClip ? 0.0 : SAPC < loConThresh ? SAPC - SAPC * loConFactor * loConOffset : SAPC - loConOffset;
    }
    else {
        SAPC = (Math.pow(Ybg, revBG) - Math.pow(Ytxt, revTXT)) * scaleWoB;
        outputContrast =
            SAPC > -loClip ? 0.0 : SAPC > -loConThresh ? SAPC - SAPC * loConFactor * loConOffset : SAPC + loConOffset;
    }
    return outputContrast * 100;
}
exports.APCAContrast = APCAContrast;
//# sourceMappingURL=apca_color_contrast.js.map