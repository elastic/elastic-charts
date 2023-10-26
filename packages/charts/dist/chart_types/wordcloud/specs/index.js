"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightFn = exports.Wordcloud = void 0;
const __1 = require("../..");
const constants_1 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
const viewmodel_types_1 = require("../layout/types/viewmodel_types");
exports.Wordcloud = (0, spec_factory_1.specComponentFactory)()({
    chartType: __1.ChartType.Wordcloud,
    specType: constants_1.SpecType.Series,
}, {
    ...viewmodel_types_1.defaultWordcloudSpec,
});
var viewmodel_types_2 = require("../layout/types/viewmodel_types");
Object.defineProperty(exports, "WeightFn", { enumerable: true, get: function () { return viewmodel_types_2.WeightFn; } });
//# sourceMappingURL=index.js.map