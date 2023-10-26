"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPanelClipping = void 0;
const CLIPPING_MARGIN = 0.5;
function getPanelClipping(panel, rotation) {
    const vertical = Math.abs(rotation) === 90;
    const width = (vertical ? panel.height : panel.width) + CLIPPING_MARGIN * 2;
    const height = (vertical ? panel.width : panel.height) + CLIPPING_MARGIN * 2;
    return { x: -CLIPPING_MARGIN, y: -CLIPPING_MARGIN, width, height };
}
exports.getPanelClipping = getPanelClipping;
//# sourceMappingURL=panel_clipping.js.map