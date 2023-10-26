"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heatmap = exports.heatmapBuildProps = void 0;
const scale_defaults_1 = require("./scale_defaults");
const __1 = require("../..");
const predicate_1 = require("../../../common/predicate");
const constants_1 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
const common_1 = require("../../../utils/common");
exports.heatmapBuildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.Heatmap,
    specType: constants_1.SpecType.Series,
}, {
    data: [],
    valueAccessor: ({ value }) => value,
    xScale: { type: scale_defaults_1.X_SCALE_DEFAULT.type },
    valueFormatter: (value) => `${value}`,
    xSortPredicate: predicate_1.Predicate.AlphaAsc,
    ySortPredicate: predicate_1.Predicate.AlphaAsc,
    xAccessor: (d) => d === null || d === void 0 ? void 0 : d.x,
    yAccessor: (d) => d === null || d === void 0 ? void 0 : d.y,
    timeZone: 'UTC',
    xAxisTitle: '',
    yAxisTitle: '',
    xAxisLabelName: 'X Value',
    xAxisLabelFormatter: String,
    yAxisLabelName: 'Y Value',
    yAxisLabelFormatter: String,
});
const Heatmap = function (props) {
    const { defaults, overrides } = exports.heatmapBuildProps;
    (0, spec_factory_1.useSpecFactory)({ ...defaults, ...(0, common_1.stripUndefined)(props), ...overrides });
    return null;
};
exports.Heatmap = Heatmap;
//# sourceMappingURL=heatmap.js.map