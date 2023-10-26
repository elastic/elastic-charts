"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotIcon = void 0;
const react_1 = __importDefault(require("react"));
const fast_deep_equal_1 = require("../../../utils/fast_deep_equal");
class DotIcon extends react_1.default.Component {
    shouldComponentUpdate(nextProps) {
        return !(0, fast_deep_equal_1.deepEqual)(this.props, nextProps);
    }
    render() {
        return (react_1.default.createElement("svg", { width: 16, height: 16, viewBox: "0 0 16 16", xmlns: "http://www.w3.org/2000/svg", ...this.props },
            react_1.default.createElement("circle", { cx: 8, cy: 8, r: 4 })));
    }
}
exports.DotIcon = DotIcon;
//# sourceMappingURL=dot.js.map