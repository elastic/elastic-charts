"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebugStateSelector = void 0;
const get_chart_container_dimensions_1 = require("./get_chart_container_dimensions");
const getDebugStateSelector = (state) => {
    if (state.internalChartState) {
        const { height, width } = (0, get_chart_container_dimensions_1.getChartContainerDimensionsSelector)(state);
        if (height * width > 0) {
            return state.internalChartState.getDebugState(state);
        }
    }
    return {};
};
exports.getDebugStateSelector = getDebugStateSelector;
//# sourceMappingURL=get_debug_state.js.map