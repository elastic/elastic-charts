"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axis = void 0;
var __1 = require("../..");
var constants_1 = require("../../../specs/constants");
var spec_factory_1 = require("../../../state/spec_factory");
var common_1 = require("../../../utils/common");
var specs_1 = require("../utils/specs");
exports.Axis = (0, spec_factory_1.specComponentFactory)()({
    chartType: __1.ChartType.XYAxis,
    specType: constants_1.SpecType.Axis,
}, {
    groupId: specs_1.DEFAULT_GLOBAL_ID,
    hide: false,
    showOverlappingTicks: false,
    showOverlappingLabels: false,
    position: common_1.Position.Left,
    timeAxisLayerCount: 0,
});
//# sourceMappingURL=axis.js.map