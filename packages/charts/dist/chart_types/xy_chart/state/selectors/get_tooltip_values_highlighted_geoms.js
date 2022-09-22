"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHighlightedGeomsSelector = exports.getTooltipInfoSelector = exports.getTooltipInfoAndGeometriesSelector = void 0;
var specs_1 = require("../../../../specs");
var constants_1 = require("../../../../specs/constants");
var create_selector_1 = require("../../../../state/create_selector");
var get_chart_rotation_1 = require("../../../../state/selectors/get_chart_rotation");
var get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
var get_tooltip_spec_1 = require("../../../../state/selectors/get_tooltip_spec");
var common_1 = require("../../../../utils/common");
var events_1 = require("../../../../utils/events");
var series_sort_1 = require("../../../../utils/series_sort");
var utils_1 = require("../../rendering/utils");
var tooltip_1 = require("../../tooltip/tooltip");
var default_series_sort_fn_1 = require("../../utils/default_series_sort_fn");
var spec_1 = require("../utils/spec");
var get_computed_scales_1 = require("./get_computed_scales");
var get_elements_at_cursor_pos_1 = require("./get_elements_at_cursor_pos");
var get_oriented_projected_pointer_position_1 = require("./get_oriented_projected_pointer_position");
var get_projected_pointer_position_1 = require("./get_projected_pointer_position");
var get_si_dataseries_map_1 = require("./get_si_dataseries_map");
var get_specs_1 = require("./get_specs");
var has_single_series_1 = require("./has_single_series");
var EMPTY_VALUES = Object.freeze({
    tooltip: {
        header: null,
        values: [],
    },
    highlightedGeometries: [],
});
var getExternalPointerEventStateSelector = function (state) { return state.externalEvents.pointer; };
exports.getTooltipInfoAndGeometriesSelector = (0, create_selector_1.createCustomCachedSelector)([
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
    var x = orientedProjectedPointerPosition.x, y = orientedProjectedPointerPosition.y;
    var tooltipType = (0, specs_1.getTooltipType)(tooltip, settings);
    if ((0, events_1.isValidPointerOverEvent)(scales.xScale, externalPointerEvent)) {
        tooltipType = (0, specs_1.getTooltipType)(tooltip, settings, true);
        if ((0, common_1.isNil)(externalPointerEvent.x)) {
            return EMPTY_VALUES;
        }
        var scaledX = scales.xScale.pureScale(externalPointerEvent.x);
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
    var header = null;
    var highlightedGeometries = [];
    var xValues = new Set();
    var hideNullValues = !tooltip.showNullValues;
    var values = matchingGeoms.reduce(function (acc, indexedGeometry) {
        if (hideNullValues && indexedGeometry.value.y === null) {
            return acc;
        }
        var specId = indexedGeometry.seriesIdentifier.specId;
        var spec = (0, spec_1.getSpecsById)(seriesSpecs, specId);
        if (!spec) {
            return acc;
        }
        var _a = (0, spec_1.getAxesSpecForSpecId)(axesSpecs, spec.groupId, chartRotation), xAxis = _a.xAxis, yAxis = _a.yAxis;
        var yScale = scales.yScales.get((0, spec_1.getSpecDomainGroupId)(spec));
        if (!yScale) {
            return acc;
        }
        var isHighlighted = false;
        if ((!externalPointerEvent || (0, specs_1.isPointerOutEvent)(externalPointerEvent)) &&
            (0, utils_1.isPointOnGeometry)(x, y, indexedGeometry, settings.pointBuffer)) {
            isHighlighted = true;
            highlightedGeometries.push(indexedGeometry);
        }
        if (!isHighlighted && (0, specs_1.isFollowTooltipType)(tooltipType)) {
            return acc;
        }
        var formattedTooltip = (0, tooltip_1.formatTooltip)(indexedGeometry, spec, false, isHighlighted, hasSingleSeries, yAxis);
        if (!header) {
            var formatterAxis = tooltip.headerFormatter ? undefined : xAxis;
            header = (0, tooltip_1.formatTooltip)(indexedGeometry, spec, true, false, hasSingleSeries, formatterAxis);
        }
        xValues.add(indexedGeometry.value.x);
        return __spreadArray(__spreadArray([], __read(acc), false), [formattedTooltip], false);
    }, []);
    if (values.length > 1 && xValues.size === values.length) {
        header = null;
    }
    var tooltipSortFn = (0, series_sort_1.getTooltipCompareFn)(function (a, b) {
        var aDs = serialIdentifierDataSeriesMap[a.key];
        var bDs = serialIdentifierDataSeriesMap[b.key];
        return (0, default_series_sort_fn_1.defaultXYLegendSeriesSort)(aDs, bDs);
    });
    var sortedTooltipValues = values.sort(function (a, b) {
        return tooltipSortFn(a.seriesIdentifier, b.seriesIdentifier);
    });
    return {
        tooltip: {
            header: header,
            values: sortedTooltipValues,
        },
        highlightedGeometries: highlightedGeometries,
    };
}
exports.getTooltipInfoSelector = (0, create_selector_1.createCustomCachedSelector)([exports.getTooltipInfoAndGeometriesSelector], function (_a) {
    var tooltip = _a.tooltip;
    return tooltip;
});
exports.getHighlightedGeomsSelector = (0, create_selector_1.createCustomCachedSelector)([exports.getTooltipInfoAndGeometriesSelector], function (_a) {
    var highlightedGeometries = _a.highlightedGeometries;
    return highlightedGeometries;
});
//# sourceMappingURL=get_tooltip_values_highlighted_geoms.js.map