"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
const ts_debounce_1 = require("ts-debounce");
function debounce(func, waitMilliseconds, options) {
    return (0, ts_debounce_1.debounce)(func, waitMilliseconds, options);
}
exports.debounce = debounce;
//# sourceMappingURL=debounce.js.map