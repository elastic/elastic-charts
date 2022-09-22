"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPanelClipping = void 0;
var CLIPPING_MARGIN = 0.5;
function getPanelClipping(panel, rotation) {
    var vertical = Math.abs(rotation) === 90;
    var width = (vertical ? panel.height : panel.width) + CLIPPING_MARGIN * 2;
    var height = (vertical ? panel.width : panel.height) + CLIPPING_MARGIN * 2;
    return { x: -CLIPPING_MARGIN, y: -CLIPPING_MARGIN, width: width, height: height };
}
exports.getPanelClipping = getPanelClipping;
//# sourceMappingURL=panel_clipping.js.map