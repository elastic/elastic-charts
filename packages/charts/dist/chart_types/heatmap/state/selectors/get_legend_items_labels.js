"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItemsLabelsSelector = void 0;
const compute_legend_1 = require("./compute_legend");
const create_selector_1 = require("../../../../state/create_selector");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
exports.getLegendItemsLabelsSelector = (0, create_selector_1.createCustomCachedSelector)([compute_legend_1.computeLegendSelector, get_settings_spec_1.getSettingsSpecSelector], (legendItems, { showLegendExtra }) => legendItems.map(({ label, defaultExtra }) => {
    var _a;
    return ({
        label: `${label}${showLegendExtra ? (_a = defaultExtra === null || defaultExtra === void 0 ? void 0 : defaultExtra.formatted) !== null && _a !== void 0 ? _a : '' : ''}`,
        depth: 0,
    });
}));
//# sourceMappingURL=get_legend_items_labels.js.map