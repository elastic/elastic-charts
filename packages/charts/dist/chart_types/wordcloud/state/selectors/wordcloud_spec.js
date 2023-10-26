"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWordcloudSpecSelector = void 0;
const __1 = require("../../..");
const constants_1 = require("../../../../specs/constants");
const utils_1 = require("../../../../state/utils");
function getWordcloudSpecSelector(state) {
    return (0, utils_1.getSpecFromStore)(state.specs, __1.ChartType.Wordcloud, constants_1.SpecType.Series, false);
}
exports.getWordcloudSpecSelector = getWordcloudSpecSelector;
//# sourceMappingURL=wordcloud_spec.js.map