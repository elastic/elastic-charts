"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementClickCaller = void 0;
var __1 = require("../../..");
var event_handler_selectors_1 = require("../../../../common/event_handler_selectors");
var create_selector_1 = require("../../../../state/create_selector");
var get_last_click_1 = require("../../../../state/selectors/get_last_click");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var partition_spec_1 = require("./partition_spec");
var picked_shapes_1 = require("./picked_shapes");
function createOnElementClickCaller() {
    var prev = { click: null };
    var selector = null;
    return function (state) {
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