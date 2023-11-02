"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecsByType = void 0;
const create_selector_1 = require("../create_selector");
const utils_1 = require("../utils");
const getSpecsByType = (chartType, specType) => (0, create_selector_1.createCustomCachedSelector)([(state) => state.specs], (specs) => {
    return (0, utils_1.getSpecsFromStore)(specs, chartType, specType);
});
exports.getSpecsByType = getSpecsByType;
//# sourceMappingURL=get_specs_by_type.js.map