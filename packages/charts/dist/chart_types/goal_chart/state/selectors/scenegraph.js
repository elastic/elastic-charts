"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const viewmodel_1 = require("../../layout/viewmodel/viewmodel");
function render(spec, parentDimensions, theme) {
    return (0, viewmodel_1.shapeViewModel)(spec, theme, parentDimensions);
}
exports.render = render;
//# sourceMappingURL=scenegraph.js.map