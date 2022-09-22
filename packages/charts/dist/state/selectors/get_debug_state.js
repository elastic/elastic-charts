"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugStateSelector = void 0;
var get_chart_container_dimensions_1 = require("./get_chart_container_dimensions");
var getDebugStateSelector = function (state) {
    if (state.internalChartState) {
        var _a = (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state), height = _a.height, width = _a.width;
        if (height * width > 0) {
            return state.internalChartState.getDebugState(state);
        }
    }
    return {};
};
exports.getDebugStateSelector = getDebugStateSelector;
//# sourceMappingURL=get_debug_state.js.map