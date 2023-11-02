"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmallMultiples = exports.DEFAULT_SM_PANEL_PADDING = void 0;
const constants_1 = require("./constants");
const chart_types_1 = require("../chart_types");
const spec_factory_1 = require("../state/spec_factory");
exports.DEFAULT_SM_PANEL_PADDING = { outer: 0, inner: 0.1 };
exports.SmallMultiples = (0, spec_factory_1.specComponentFactory)()({
    chartType: chart_types_1.ChartType.Global,
    specType: constants_1.SpecType.SmallMultiples,
}, {
    id: '__global__small_multiples___',
});
//# sourceMappingURL=small_multiples.js.map