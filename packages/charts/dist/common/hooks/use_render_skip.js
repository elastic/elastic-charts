"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRenderSkip = void 0;
const react_1 = require("react");
function useRenderSkip(rendersToSkip = 1) {
    const [renderCount, setRenderCount] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (renderCount >= rendersToSkip)
            return;
        setRenderCount((n) => n + 1);
    }, rendersToSkip === 1 ? [] : undefined);
    return renderCount >= rendersToSkip;
}
exports.useRenderSkip = useRenderSkip;
//# sourceMappingURL=use_render_skip.js.map