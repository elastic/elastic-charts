"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementClickCaller = void 0;
const partition_spec_1 = require("./partition_spec");
const picked_shapes_1 = require("./picked_shapes");
const __1 = require("../../..");
const event_handler_selectors_1 = require("../../../../common/event_handler_selectors");
const create_selector_1 = require("../../../../state/create_selector");
const get_last_click_1 = require("../../../../state/selectors/get_last_click");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
function createOnElementClickCaller() {
    const prev = { click: null };
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.Partition) {
            selector = (0, create_selector_1.createCustomCachedSelector)([partition_spec_1.getPartitionSpec, get_last_click_1.getLastClickSelector, get_settings_spec_1.getSettingsSpecSelector, picked_shapes_1.getPickedShapesLayerValues], (0, event_handler_selectors_1.getOnElementClickSelector)(prev));
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementClickCaller = createOnElementClickCaller;
//# sourceMappingURL=on_element_click_caller.js.map