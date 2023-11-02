"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configMetadata = void 0;
const constants_1 = require("../../../../common/constants");
exports.configMetadata = {
    angleStart: { dflt: Math.PI + Math.PI / 4, min: -constants_1.TAU, max: constants_1.TAU, type: 'number' },
    angleEnd: { dflt: -Math.PI / 4, min: -constants_1.TAU, max: constants_1.TAU, type: 'number' },
    margin: {
        type: 'group',
        values: {
            left: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
            right: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
            top: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
            bottom: { dflt: 0, min: -0.25, max: 0.25, type: 'number' },
        },
    },
    fontFamily: {
        dflt: 'Sans-Serif',
        type: 'string',
    },
    minFontSize: { dflt: 8, min: 0.1, max: 8, type: 'number', reconfigurable: true },
    maxFontSize: { dflt: 64, min: 0.1, max: 64, type: 'number' },
    backgroundColor: { dflt: '#ffffff', type: 'color' },
    sectorLineWidth: { dflt: 1, min: 0, max: 4, type: 'number' },
};
//# sourceMappingURL=config.js.map