"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partition = void 0;
var __1 = require("../..");
var constants_1 = require("../../../specs/constants");
var spec_factory_1 = require("../../../state/spec_factory");
var common_1 = require("../../../utils/common");
var config_1 = require("../layout/config");
var config_types_1 = require("../layout/types/config_types");
var group_by_rollup_1 = require("../layout/utils/group_by_rollup");
var buildProps = (0, spec_factory_1.buildSFProps)()({
    chartType: __1.ChartType.Partition,
    specType: constants_1.SpecType.Series,
}, {
    valueAccessor: function (d) { return (typeof d === 'number' ? d : 0); },
    valueGetter: function (n) { return n[group_by_rollup_1.AGGREGATE_KEY]; },
    valueFormatter: function (d) { return String(d); },
    percentFormatter: config_1.percentFormatter,
    topGroove: 20,
    smallMultiples: '__global__small_multiples___',
    layers: [
        {
            groupByRollup: function (_, i) { return i; },
            nodeLabel: function (d) { return String(d); },
            showAccessor: function () { return true; },
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
var Partition = function (props) {
    var defaults = buildProps.defaults, overrides = buildProps.overrides;
    (0, spec_factory_1.useSpecFactory)(__assign(__assign(__assign({}, defaults), (0, common_1.stripUndefined)(props)), overrides));
    return null;
};
exports.Partition = Partition;
//# sourceMappingURL=index.js.map