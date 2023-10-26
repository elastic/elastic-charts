"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partition = void 0;
const __1 = require("../..");
const constants_1 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
const common_1 = require("../../../utils/common");
const config_1 = require("../layout/config");
const config_types_1 = require("../layout/types/config_types");
const group_by_rollup_1 = require("../layout/utils/group_by_rollup");
const buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.Partition,
    specType: constants_1.SpecType.Series,
}, {
    valueAccessor: (d) => (typeof d === 'number' ? d : 0),
    valueGetter: (n) => n[group_by_rollup_1.AGGREGATE_KEY],
    valueFormatter: (d) => String(d),
    percentFormatter: config_1.percentFormatter,
    topGroove: 20,
    smallMultiples: '__global__small_multiples___',
    layers: [
        {
            groupByRollup: (_, i) => i,
            nodeLabel: (d) => String(d),
            showAccessor: () => true,
            fillLabel: {},
        },
    ],
    clockwiseSectors: true,
    specialFirstInnermostSector: true,
    layout: config_types_1.PartitionLayout.sunburst,
    drilldown: false,
    maxRowCount: 12,
    fillOutside: false,
    radiusOutside: 128,
    fillRectangleWidth: Infinity,
    fillRectangleHeight: Infinity,
    animation: { duration: 0 },
});
const Partition = function (props) {
    const { defaults, overrides } = buildProps;
    (0, spec_factory_1.useSpecFactory)({ ...defaults, ...(0, common_1.stripUndefined)(props), ...overrides });
    return null;
};
exports.Partition = Partition;
//# sourceMappingURL=index.js.map