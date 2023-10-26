"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLegendAction = void 0;
const react_1 = require("react");
function useLegendAction() {
    const ref = (0, react_1.useRef)(null);
    const onClose = () => {
        if (ref.current) {
            requestAnimationFrame(() => { var _a, _b; return (_b = (_a = ref === null || ref === void 0 ? void 0 : ref.current) === null || _a === void 0 ? void 0 : _a.focus) === null || _b === void 0 ? void 0 : _b.call(_a); });
        }
    };
    return [ref, onClose];
}
exports.useLegendAction = useLegendAction;
//# sourceMappingURL=use_legend_action.js.map