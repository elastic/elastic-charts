"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedGeomsSelector = exports.getTooltipInfoSelector = exports.getHighlightedTooltipTooltipValuesSelector = exports.getTooltipInfoAndGeomsSelector = void 0;
const get_computed_scales_1 = require("./get_computed_scales");
const get_elements_at_cursor_pos_1 = require("./get_elements_at_cursor_pos");
const get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
const get_projected_pointer_position_1 = require("./get_projected_pointer_position");
const get_si_dataseries_map_1 = require("./get_si_dataseries_map");
const get_specs_1 = require("./get_specs");
const has_single_series_1 = require("./has_single_series");
const specs_1 = require("../../../../specs");
const constants_1 = require("../../../../specs/constants");
const create_selector_1 = require("../../../../state/create_selector");
const get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const get_tooltip_interaction_state_1 = require("../../../../state/selectors/get_tooltip_interaction_state");
const get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
const common_1 = require("../../../../utils/common");
const events_1 = require("../../../../utils/events");
const series_sort_1 = require("../../../../utils/series_sort");
const utils_1 = require("../../rendering/utils");
const tooltip_1 = require("../../tooltip/tooltip");
const default_series_sort_fn_1 = require("../../utils/default_series_sort_fn");
const spec_1 = require("../utils/spec");
const EMPTY_VALUES = Object.freeze({
    tooltip: {
        header: null,
        values: [],
    },
    highlightedGeometries: [],
});
const getExternalPointerEventStateSelector = (state) => state.externalEvents.pointer;
exports.getTooltipInfoAndGeomsSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_specs_1.getSeriesSpecsSelector,
    get_specs_1.getAxisSpecsSelector,
    get_settings_spec_1.getSettingsSpecSelector,
    get_projected_pointer_position_1.getProjectedPointerPositionSelector,
    get_oriented_projected_pointer_position_1.getOrientedProjectedPointerPositionSelector,
    get_chart_rotation_1.getChartRotationSelector,
    has_single_series_1.hasSingleSeriesSelector,
    get_computed_scales_1.getComputedScalesSelector,
    get_elements_at_cursor_pos_1.getElementAtCursorPositionSelector,
    get_si_dataseries_map_1.getSiDataSeriesMapSelector,
    getExternalPointerEventStateSelector,
    get_tooltip_spec_1.getTooltipSpecSelector,
], getTooltipAndHighlightFromValue);
function getTooltipAndHighlightFromValue(seriesSpecs, axesSpecs, settings, projectedPointerPosition, orientedProjectedPointerPosition, chartRotation, hasSingleSeries, scales, matchingGeoms, serialIdentifierDataSeriesMap, externalPointerEvent, tooltip) {
    if (!scales.xScale || !scales.yScales) {
        return EMPTY_VALUES;
    }
    let { x, y } = orientedProjectedPointerPosition;
    let tooltipType = (0, specs_1.getTooltipType)(tooltip, settings);
    if ((0, events_1.isValidPointerOverEvent)(scales.xScale, externalPointerEvent)) {
        tooltipType = (0, specs_1.getTooltipType)(tooltip, settings, true);
        if ((0, common_1.isNil)(externalPointerEvent.x)) {
            return EMPTY_VALUES;
        }
        const scaledX = scales.xScale.pureScale(externalPointerEvent.x);
        if (Number.isNaN(scaledX)) {
            return EMPTY_VALUES;
        }
        x = scaledX;
        y = 0;
    }
    else if (projectedPointerPosition.x === -1 || projectedPointerPosition.y === -1) {
        return EMPTY_VALUES;
    }
    if (tooltipType === constants_1.TooltipType.None && !externalPointerEvent) {
        return EMPTY_VALUES;
    }
    if (matchingGeoms.length === 0) {
        return EMPTY_VALUES;
    }
    let header = null;
    const highlightedGeometries = [];
    const xValues = new Set();
    const hideNullValues = !tooltip.showNullValues;
    const values = matchingGeoms.reduce((acc, indexedGeometry) => {
        if (hideNullValues && indexedGeometry.value.y === null) {
            return acc;
        }
        const { seriesIdentifier: { specId }, } = indexedGeometry;
        const spec = (0, spec_1.getSpecsById)(seriesSpecs, specId);
        if (!spec) {
            return acc;
        }
        const { xAxis, yAxis } = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, spec.groupId, chartRotation);
        const yScale = scales.yScales.get((0, spec_1.getSpecDomainGroupId)(spec));
        if (!yScale) {
            return acc;
        }
        let isHighlighted = false;
        if ((!externalPointerEvent || (0, specs_1.isPointerOutEvent)(externalPointerEvent)) &&
            (0, utils_1.isPointOnGeometry)(x, y, indexedGeometry, settings.pointBuffer)) {
            isHighlighted = true;
            highlightedGeometries.push(indexedGeometry);
        }
        const formattedTooltip = (0, tooltip_1.formatTooltipValue)(indexedGeometry, spec, isHighlighted, hasSingleSeries, yAxis);
        if (!header) {
            const formatterAxis = tooltip.headerFormatter ? undefined : xAxis;
            header = (0, tooltip_1.formatTooltipHeader)(indexedGeometry, spec, formatterAxis);
        }
        xValues.add(indexedGeometry.value.x);
        return [...acc, formattedTooltip];
    }, []);
    if (values.length > 1 && xValues.size === values.length) {
        header = null;
    }
    const tooltipSortFn = (0, series_sort_1.getTooltipCompareFn)((a, b) => {
        const aDs = serialIdentifierDataSeriesMap[a.key];
        const bDs = serialIdentifierDataSeriesMap[b.key];
        return (0, default_series_sort_fn_1.defaultXYLegendSeriesSort)(aDs, bDs);
    });
    const sortedTooltipValues = values.sort((a, b) => {
        return tooltipSortFn(a.seriesIdentifier, b.seriesIdentifier);
    });
    return {
        tooltip: {
            header,
            values: sortedTooltipValues,
        },
        highlightedGeometries,
    };
}
exports.getHighlightedTooltipTooltipValuesSelector = (0, create_selector_1.createCustomCachedSelector)([get_tooltip_interaction_state_1.getTooltipInteractionState, exports.getTooltipInfoAndGeomsSelector, get_tooltip_spec_1.getTooltipSpecSelector, get_settings_spec_1.getSettingsSpecSelector], ({ pinned }, values, tooltip, settings) => {
    const tooltipType = (0, specs_1.getTooltipType)(tooltip, settings);
    const highlightedValues = values.tooltip.values.filter((v) => v.isHighlighted);
    const hasTooltipContent = values.tooltip.values.length > tooltip.maxTooltipItems && highlightedValues.length > 0;
    if (!pinned && !tooltip.customTooltip && ((0, specs_1.isFollowTooltipType)(tooltipType) || hasTooltipContent)) {
        return {
            ...values,
            tooltip: {
                ...values.tooltip,
                values: highlightedValues,
            },
        };
    }
    return values;
});
exports.getTooltipInfoSelector = (0, create_selector_1.createCustomCachedSelector)([exports.getHighlightedTooltipTooltipValuesSelector], ({ tooltip }) => tooltip);
exports.getHighlightedGeomsSelector = (0, create_selector_1.createCustomCachedSelector)([exports.getHighlightedTooltipTooltipValuesSelector], ({ highlightedGeometries }) => highlightedGeometries);
//# sourceMappingURL=get_tooltip_values_highlighted_geoms.js.map