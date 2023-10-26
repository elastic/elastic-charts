"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areaGenerator = exports.lineGenerator = void 0;
const d3_shape_1 = require("d3-shape");
const curves_1 = require("../utils/curves");
function lineGenerator(xProject, yProject, defined, curve) {
    const generator = (0, d3_shape_1.line)().x(xProject).y(yProject).defined(defined).curve((0, curves_1.getCurveFactory)(curve));
    return (d) => { var _a; return (_a = generator(d)) !== null && _a !== void 0 ? _a : ''; };
}
exports.lineGenerator = lineGenerator;
function areaGenerator(xProject, y0Project, y1Project, defined, curve) {
    const generator = (0, d3_shape_1.area)().x(xProject).y0(y0Project).y1(y1Project).defined(defined).curve((0, curves_1.getCurveFactory)(curve));
    return {
        y0: (d) => { var _a; return (_a = generator.lineY0()(d)) !== null && _a !== void 0 ? _a : ''; },
        y1: (d) => { var _a; return (_a = generator.lineY1()(d)) !== null && _a !== void 0 ? _a : ''; },
        area: (d) => { var _a; return (_a = generator(d)) !== null && _a !== void 0 ? _a : ''; },
    };
}
exports.areaGenerator = areaGenerator;
//# sourceMappingURL=path.js.map