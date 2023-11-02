"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaSeries = void 0;
const __1 = require("../..");
const constants_1 = require("../../../scales/constants");
const constants_2 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
const common_1 = require("../../../utils/common");
const specs_1 = require("../utils/specs");
const buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.XYAxis,
    specType: constants_2.SpecType.Series,
    seriesType: specs_1.SeriesType.Area,
}, {
    groupId: specs_1.DEFAULT_GLOBAL_ID,
    xScaleType: constants_1.ScaleType.Linear,
    yScaleType: constants_1.ScaleType.Linear,
    hideInLegend: false,
    histogramModeAlignment: specs_1.HistogramModeAlignments.Center,
});
const AreaSeries = function (props) {
    const { defaults, overrides } = buildProps;
    (0, spec_factory_1.useSpecFactory)({ ...defaults, ...(0, common_1.stripUndefined)(props), ...overrides });
    return null;
};
exports.AreaSeries = AreaSeries;
//# sourceMappingURL=area_series.js.map