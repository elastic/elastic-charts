"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipInfoSelector = void 0;
const get_goal_spec_1 = require("./get_goal_spec");
const picked_shapes_1 = require("./picked_shapes");
const colors_1 = require("../../../../common/colors");
const create_selector_1 = require("../../../../state/create_selector");
const EMPTY_TOOLTIP = Object.freeze({
    header: null,
    values: [],
});
const getBandColor = (value, bands) => {
    var _a, _b;
    return (_b = (_a = bands.find(({ value: v }) => {
        return v >= value;
    })) === null || _a === void 0 ? void 0 : _a.fillColor) !== null && _b !== void 0 ? _b : colors_1.Colors.White.keyword;
};
exports.getTooltipInfoSelector = (0, create_selector_1.createCustomCachedSelector)([get_goal_spec_1.getGoalSpecSelector, picked_shapes_1.getPickedShapes], (spec, pickedShapes) => {
    if (!spec) {
        return EMPTY_TOOLTIP;
    }
    const { tooltipValueFormatter, id } = spec;
    const tooltipInfo = {
        header: null,
        values: [],
    };
    pickedShapes.forEach(({ actual: value, bands }) => {
        tooltipInfo.values.push({
            label: 'Actual',
            color: getBandColor(value, bands),
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
                specId: id,
                key: id,
            },
            value,
            formattedValue: tooltipValueFormatter(value),
            datum: value,
        });
    });
    return tooltipInfo;
});
//# sourceMappingURL=tooltip.js.map