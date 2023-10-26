"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnElementOutCaller = void 0;
const picked_shapes_1 = require("./picked_shapes");
const wordcloud_spec_1 = require("./wordcloud_spec");
const __1 = require("../../..");
const event_handler_selectors_1 = require("../../../../common/event_handler_selectors");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
function createOnElementOutCaller() {
    const prev = { pickedShapes: null };
    let selector = null;
    return (state) => {
        if (selector === null && state.chartType === __1.ChartType.Wordcloud) {
            selector = (0, create_selector_1.createCustomCachedSelector)([wordcloud_spec_1.getWordcloudSpecSelector, picked_shapes_1.getPickedShapesLayerValues, get_settings_spec_1.getSettingsSpecSelector], (0, event_handler_selectors_1.getOnElementOutSelector)(prev));
        }
        if (selector) {
            selector(state);
        }
    };
}
exports.createOnElementOutCaller = createOnElementOutCaller;
//# sourceMappingURL=on_element_out_caller.js.map