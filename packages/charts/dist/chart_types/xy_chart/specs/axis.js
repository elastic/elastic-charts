"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Axis = void 0;
const __1 = require("../..");
const constants_1 = require("../../../specs/constants");
const spec_factory_1 = require("../../../state/spec_factory");
const common_1 = require("../../../utils/common");
const specs_1 = require("../utils/specs");
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