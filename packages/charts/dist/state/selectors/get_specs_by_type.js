"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecsByType = void 0;
var create_selector_1 = require("../create_selector");
var utils_1 = require("../utils");
var getSpecsByType = function (chartType, specType) {
    return (0, create_selector_1.createCustomCachedSelector)([function (state) { return state.specs; }], function (specs) {
        return (0, utils_1.getSpecsFromStore)(specs, chartType, specType);
    });
};
exports.getSpecsByType = getSpecsByType;
//# sourceMappingURL=get_specs_by_type.js.map