"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipInfoSelector = void 0;
var color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
var colors_1 = require("../../../../common/colors");
var create_selector_1 = require("../../../../state/create_selector");
var heatmap_spec_1 = require("./heatmap_spec");
var picked_shapes_1 = require("./picked_shapes");
var EMPTY_TOOLTIP = Object.freeze({
    header: null,
    values: [],
    disableActions: false,
});
exports.getTooltipInfoSelector = (0, create_selector_1.createCustomCachedSelector)([heatmap_spec_1.getSpecOrNull, picked_shapes_1.getPickedShapes], function (spec, pickedShapes) {
    if (!spec) {
        return EMPTY_TOOLTIP;
    }
    var tooltipInfo = {
        header: null,
        values: [],
        disableActions: false,
    };
    if (Array.isArray(pickedShapes)) {
        pickedShapes
            .filter(function (_a) {
            var visible = _a.visible;
            return visible;
        })
            .forEach(function (shape) {
            var _a;
            tooltipInfo.values.push({
                label: spec.xAxisLabelName,
                color: colors_1.Colors.Transparent.keyword,
                isHighlighted: false,
                isVisible: true,
                seriesIdentifier: {
                    specId: spec.id,
                    key: spec.id,
                },
                value: "".concat(shape.datum.x),
                formattedValue: spec.xAxisLabelFormatter(shape.datum.x),
                datum: shape.datum,
                displayOnly: true,
            });
            tooltipInfo.values.push({
                label: spec.yAxisLabelName,
                color: colors_1.Colors.Transparent.keyword,
                isHighlighted: false,
                isVisible: true,
                seriesIdentifier: {
                    specId: spec.id,
                    key: spec.id,
                },
                value: "".concat(shape.datum.y),
                formattedValue: spec.yAxisLabelFormatter(shape.datum.y),
                datum: shape.datum,
                displayOnly: true,
            });
            tooltipInfo.values.push({
                label: (_a = spec.name) !== null && _a !== void 0 ? _a : spec.id,
                color: (0, color_library_wrappers_1.RGBATupleToString)(shape.fill.color),
                isHighlighted: false,
                isVisible: true,
                seriesIdentifier: {
                    specId: spec.id,
                    key: spec.id,
                },
                value: "".concat(shape.value),
                formattedValue: "".concat(shape.formatted),
                datum: shape.datum,
            });
        });
    }
    else {
        tooltipInfo.values.push({
            label: '',
            color: colors_1.Colors.Transparent.keyword,
            isHighlighted: false,
            isVisible: true,
            seriesIdentifier: {
                specId: spec.id,
                key: spec.id,
            },
            value: "".concat(pickedShapes.value),
            formattedValue: "".concat(pickedShapes.value),
            datum: pickedShapes.value,
            displayOnly: true,
        });
        tooltipInfo.disableActions = true;
    }
    return tooltipInfo;
});
//# sourceMappingURL=tooltip.js.map