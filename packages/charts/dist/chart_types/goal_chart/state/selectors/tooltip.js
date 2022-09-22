"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipInfoSelector = void 0;
var colors_1 = require("../../../../common/colors");
var create_selector_1 = require("../../../../state/create_selector");
var goal_spec_1 = require("./goal_spec");
var picked_shapes_1 = require("./picked_shapes");
var EMPTY_TOOLTIP = Object.freeze({
    header: null,
    values: [],
});
var getBandColor = function (value, bands) {
    var _a, _b;
    return (_b = (_a = bands.find(function (_a) {
        var v = _a.value;
        return v >= value;
    })) === null || _a === void 0 ? void 0 : _a.fillColor) !== null && _b !== void 0 ? _b : colors_1.Colors.White.keyword;
};
exports.getTooltipInfoSelector = (0, create_selector_1.createCustomCachedSelector)([goal_spec_1.getSpecOrNull, picked_shapes_1.getPickedShapes], function (spec, pickedShapes) {
    if (!spec) {
        return EMPTY_TOOLTIP;
    }
    var tooltipValueFormatter = spec.tooltipValueFormatter, id = spec.id;
    var tooltipInfo = {
        header: null,
        values: [],
    };
    pickedShapes.forEach(function (_a) {
        var value = _a.actual, bands = _a.bands;
        tooltipInfo.values.push({
            label: 'Actual',
            color: getBandColor(value, bands),
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
                specId: id,
                key: id,
            },
            value: value,
            formattedValue: tooltipValueFormatter(value),
            datum: value,
        });
    });
    return tooltipInfo;
});
//# sourceMappingURL=tooltip.js.map