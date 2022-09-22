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
exports.useRenderSkip = void 0;
var react_1 = require("react");
function useRenderSkip(rendersToSkip) {
    if (rendersToSkip === void 0) { rendersToSkip = 1; }
    var _a = __read((0, react_1.useState)(0), 2), renderCount = _a[0], setRenderCount = _a[1];
    (0, react_1.useEffect)(function () {
        if (renderCount >= rendersToSkip)
            return;
        setRenderCount(function (n) { return n + 1; });
    }, rendersToSkip === 1 ? [] : undefined);
    return renderCount >= rendersToSkip;
}
exports.useRenderSkip = useRenderSkip;
//# sourceMappingURL=use_render_skip.js.map