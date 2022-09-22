"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOverCaller = void 0;
var __1 = require("../../..");
var event_handler_selectors_1 = require("../../../../common/event_handler_selectors");
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var goal_spec_1 = require("./goal_spec");
var picked_shapes_1 = require("./picked_shapes");
function createOnElementOverCaller() {
    var prev = { pickedShapes: [] };
    var selector = null;
    return function (state) {
        if (selector === null && state.chartType === __1.ChartType.Goal) {
            selector = (0, create_selector_1.createCustomCachedSelector)([goal_spec_1.getSpecOrNull, picked_shapes_1.getPickedShapesLayerValues, get_settings_spec_1.getSettingsSpecSelector], (0, event_handler_selectors_1.getOnElementOverSelector)(prev));
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementOverCaller = createOnElementOverCaller;
//# sourceMappingURL=on_element_over_caller.js.map