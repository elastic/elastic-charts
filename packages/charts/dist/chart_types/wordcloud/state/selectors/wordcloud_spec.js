"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecOrNull = void 0;
var __1 = require("../../..");
var constants_1 = require("../../../../specs/constants");
var utils_1 = require("../../../../state/utils");
function getSpecOrNull(state) {
    var specs = (0, utils_1.getSpecsFromStore)(state.specs, __1.ChartType.Wordcloud, constants_1.SpecType.Series);
    return specs.length > 0 ? specs[0] : null;
}
exports.getSpecOrNull = getSpecOrNull;
//# sourceMappingURL=wordcloud_spec.js.map