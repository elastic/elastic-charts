"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chartSize = void 0;
const create_selector_1 = require("../../../../state/create_selector");
const getParentDimension = (state) => state.parentDimensions;
exports.chartSize = (0, create_selector_1.createCustomCachedSelector)([getParentDimension], (container) => {
    return { ...container };
});
//# sourceMappingURL=chart_size.js.map