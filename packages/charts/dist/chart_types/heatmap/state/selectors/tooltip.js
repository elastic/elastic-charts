"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTooltipInfoSelector = void 0;
const get_heatmap_spec_1 = require("./get_heatmap_spec");
const picked_shapes_1 = require("./picked_shapes");
const color_library_wrappers_1 = require("../../../../common/color_library_wrappers");
const colors_1 = require("../../../../common/colors");
const create_selector_1 = require("../../../../state/create_selector");
const EMPTY_TOOLTIP = Object.freeze({
    header: null,
    values: [],
    disableActions: false,
});
exports.getTooltipInfoSelector = (0, create_selector_1.createCustomCachedSelector)([get_heatmap_spec_1.getHeatmapSpecSelector, picked_shapes_1.getPickedShapes], (spec, pickedShapes) => {
    if (!spec) {
        return EMPTY_TOOLTIP;
    }
    const tooltipInfo = {
        header: null,
        values: [],
        disableActions: false,
    };
    if (Array.isArray(pickedShapes)) {
        pickedShapes
            .filter(({ visible }) => visible)
            .forEach((shape) => {
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
                value: `${shape.datum.x}`,
                formattedValue: spec.xAxisLabelFormatter(shape.datum.x),
                datum: shape.datum,
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
                value: `${shape.datum.y}`,
                formattedValue: spec.yAxisLabelFormatter(shape.datum.y),
                datum: shape.datum,
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
                value: `${shape.value}`,
                formattedValue: `${shape.formatted}`,
                datum: shape.datum,
                displayOnly: true,
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
            value: `${pickedShapes.value}`,
            formattedValue: `${pickedShapes.text}`,
            datum: pickedShapes.value,
            displayOnly: true,
        });
        tooltipInfo.disableActions = true;
    }
    return tooltipInfo;
});
//# sourceMappingURL=tooltip.js.map