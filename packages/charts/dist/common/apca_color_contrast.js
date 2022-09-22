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
Object.defineProperty(exports, "__esModule", { value: true });
exports.APCAContrast = void 0;
function APCAContrast(_a, _b) {
    var _c = __read(_a, 3), Rbg = _c[0], Gbg = _c[1], Bbg = _c[2];
    var _d = __read(_b, 3), Rtxt = _d[0], Gtxt = _d[1], Btxt = _d[2];
    var mainTRC = 2.4;
    var Rco = 0.2126729;
    var Gco = 0.7151522;
    var Bco = 0.072175;
    var normBG = 0.56;
    var normTXT = 0.57;
    var revTXT = 0.62;
    var revBG = 0.65;
    var blkThrs = 0.022;
    var blkClmp = 1.414;
    var deltaYmin = 0.0005;
    var scaleBoW = 1.14;
    var scaleWoB = 1.14;
    var loConThresh = 0.035991;
    var loConFactor = 27.7847239587675;
    var loConOffset = 0.027;
    var loClip = 0.001;
    var Ybg = Math.pow(Rbg / 255.0, mainTRC) * Rco + Math.pow(Gbg / 255.0, mainTRC) * Gco + Math.pow(Bbg / 255.0, mainTRC) * Bco;
    var Ytxt = Math.pow(Rtxt / 255.0, mainTRC) * Rco +
        Math.pow(Gtxt / 255.0, mainTRC) * Gco +
        Math.pow(Btxt / 255.0, mainTRC) * Bco;
    var SAPC = 0.0;
    var outputContrast = 0.0;
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