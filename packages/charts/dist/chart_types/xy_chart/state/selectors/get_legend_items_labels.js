"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLegendItemsLabelsSelector = void 0;
var create_selector_1 = require("../../../../state/create_selector");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var compute_legend_1 = require("./compute_legend");
exports.getLegendItemsLabelsSelector = (0, create_selector_1.createCustomCachedSelector)([compute_legend_1.computeLegendSelector, get_settings_spec_1.getSettingsSpecSelector], function (legendItems, _a) {
    var showLegendExtra = _a.showLegendExtra;
    return legendItems.map(function (_a) {
        var _b;
        var label = _a.label, defaultExtra = _a.defaultExtra;
        return ({
            label: defaultExtra && ((_b = defaultExtra.legendSizingLabel) !== null && _b !== void 0 ? _b : null) !== null
                ? "".concat(label).concat(showLegendExtra ? defaultExtra.legendSizingLabel : '')
                : label,
            depth: 0,
        });
    });
});
//# sourceMappingURL=get_legend_items_labels.js.map