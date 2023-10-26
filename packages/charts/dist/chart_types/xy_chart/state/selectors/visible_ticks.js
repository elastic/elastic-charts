"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisibleTickSetsSelector = exports.generateTicks = void 0;
const compute_axis_ticks_dimensions_1 = require("./compute_axis_ticks_dimensions");
const compute_series_domains_1 = require("./compute_series_domains");
const count_bars_in_cluster_1 = require("./count_bars_in_cluster");
const get_bar_paddings_1 = require("./get_bar_paddings");
const is_histogram_mode_enabled_1 = require("./is_histogram_mode_enabled");
const panel_utils_1 = require("../../../../common/panel_utils");
const scales_1 = require("../../../../scales");
const constants_1 = require("../../../../scales/constants");
const types_1 = require("../../../../scales/types");
const create_selector_1 = require("../../../../state/create_selector");
const compute_small_multiple_scales_1 = require("../../../../state/selectors/compute_small_multiple_scales");
const get_settings_spec_1 = require("../../../../state/selectors/get_settings_spec");
const canvas_text_bbox_calculator_1 = require("../../../../utils/bbox/canvas_text_bbox_calculator");
const common_1 = require("../../../../utils/common");
const multilayer_ticks_1 = require("../../axes/timeslip/multilayer_ticks");
const axis_type_utils_1 = require("../../utils/axis_type_utils");
const scales_2 = require("../../utils/scales");
const adaptiveTickCount = true;
function axisMinMax(axisPosition, chartRotation, { width, height }) {
    const horizontal = (0, axis_type_utils_1.isHorizontalAxis)(axisPosition);
    const flipped = horizontal
        ? chartRotation === -90 || chartRotation === 180
        : chartRotation === 90 || chartRotation === 180;
    return horizontal ? [flipped ? width : 0, flipped ? 0 : width] : [flipped ? 0 : height, flipped ? height : 0];
}
function getDirectionFn({ type }) {
    return type === constants_1.ScaleType.Ordinal
        ? (label) => ((0, common_1.isRTLString)(label) ? 'rtl' : 'ltr')
        : () => 'ltr';
}
function generateTicks(axisSpec, scale, ticks, offset, labelFormatter, layer, detailedLayer, showGrid) {
    const getDirection = getDirectionFn(scale);
    const isContinuous = (0, types_1.isContinuousScale)(scale);
    return ticks.map((value) => {
        const domainClampedValue = isContinuous && typeof value === 'number' ? Math.max(value, scale.domain[0]) : value;
        const label = labelFormatter(value);
        return {
            value,
            domainClampedValue,
            label,
            position: (scale.scale(value) || 0) + offset,
            domainClampedPosition: (scale.scale(domainClampedValue) || 0) + offset,
            layer,
            detailedLayer,
            showGrid,
            direction: getDirection(label),
        };
    });
}
exports.generateTicks = generateTicks;
function getVisibleTicks(axisSpec, labelBox, totalBarsInCluster, labelFormatter, rotationOffset, scale, enableHistogramMode, layer, detailedLayer, ticks, isMultilayerTimeAxis = false, showGrid = true) {
    const isSingleValueScale = scale.domain[0] === scale.domain[1];
    const makeRaster = enableHistogramMode && scale.bandwidth > 0 && !isMultilayerTimeAxis;
    const ultimateTick = ticks.at(-1);
    const penultimateTick = ticks.at(-2);
    if (makeRaster && !isSingleValueScale && typeof penultimateTick === 'number' && typeof ultimateTick === 'number') {
        const computedTickDistance = ultimateTick - penultimateTick;
        const numTicks = scale.minInterval / (computedTickDistance || scale.minInterval);
        for (let i = 1; i <= numTicks; i++)
            ticks.push(i * computedTickDistance + ultimateTick);
    }
    const shift = totalBarsInCluster > 0 ? totalBarsInCluster : 1;
    const band = scale.bandwidth / (1 - scale.barsPadding);
    const halfPadding = (band - scale.bandwidth) / 2;
    const offset = (enableHistogramMode ? -halfPadding : (scale.bandwidth * shift) / 2) + (scale.isSingleValue() ? 0 : rotationOffset);
    const firstTickValue = ticks[0];
    const allTicks = makeRaster && isSingleValueScale && typeof firstTickValue === 'number'
        ? [
            {
                value: firstTickValue,
                domainClampedValue: firstTickValue,
                label: labelFormatter(firstTickValue),
                position: (scale.scale(firstTickValue) || 0) + offset,
                domainClampedPosition: (scale.scale(firstTickValue) || 0) + offset,
                layer: undefined,
                detailedLayer: 0,
                direction: 'rtl',
                showGrid,
            },
            {
                value: firstTickValue + scale.minInterval,
                domainClampedValue: firstTickValue + scale.minInterval,
                label: labelFormatter(firstTickValue + scale.minInterval),
                position: scale.bandwidth + halfPadding * 2,
                domainClampedPosition: scale.bandwidth + halfPadding * 2,
                layer: undefined,
                detailedLayer: 0,
                direction: 'rtl',
                showGrid,
            },
        ]
        : generateTicks(axisSpec, scale, ticks, offset, labelFormatter, layer, detailedLayer, showGrid);
    const { showOverlappingTicks, showOverlappingLabels, position } = axisSpec;
    const requiredSpace = (0, axis_type_utils_1.isVerticalAxis)(position) ? labelBox.maxLabelBboxHeight / 2 : labelBox.maxLabelBboxWidth / 2;
    const bypassOverlapCheck = showOverlappingLabels || isMultilayerTimeAxis;
    return bypassOverlapCheck
        ? allTicks
        : [...allTicks]
            .sort((a, b) => a.position - b.position)
            .reduce((prev, tick) => {
            const tickLabelFits = tick.position >= prev.occupiedSpace + requiredSpace;
            if (tickLabelFits || showOverlappingTicks) {
                prev.visibleTicks.push(tickLabelFits ? tick : { ...tick, label: '' });
                if (tickLabelFits)
                    prev.occupiedSpace = tick.position + requiredSpace;
            }
            else if (adaptiveTickCount && !tickLabelFits && !showOverlappingTicks) {
                prev.visibleTicks.push({ ...tick, label: '' });
            }
            return prev;
        }, { visibleTicks: [], occupiedSpace: -Infinity }).visibleTicks;
}
function getVisibleTickSet(scale, labelBox, { rotation: chartRotation }, axisSpec, groupCount, histogramMode, layer, detailedLayer, ticks, labelFormatter, isMultilayerTimeAxis = false, showGrid = true) {
    const vertical = (0, axis_type_utils_1.isVerticalAxis)(axisSpec.position);
    const somehowRotated = (vertical && chartRotation === -90) || (!vertical && chartRotation === 180);
    const rotationOffset = histogramMode && somehowRotated ? scale.step : 0;
    return getVisibleTicks(axisSpec, labelBox, groupCount, labelFormatter, rotationOffset, scale, histogramMode, layer, detailedLayer, ticks, isMultilayerTimeAxis, showGrid);
}
exports.getVisibleTickSetsSelector = (0, create_selector_1.createCustomCachedSelector)([
    get_settings_spec_1.getSettingsSpecSelector,
    compute_axis_ticks_dimensions_1.getJoinedVisibleAxesData,
    compute_series_domains_1.computeSeriesDomainsSelector,
    compute_small_multiple_scales_1.computeSmallMultipleScalesSelector,
    count_bars_in_cluster_1.countBarsInClusterSelector,
    is_histogram_mode_enabled_1.isHistogramModeEnabledSelector,
    get_bar_paddings_1.getBarPaddingsSelector,
], getVisibleTickSets);
function getVisibleTickSets({ rotation: chartRotation, locale }, joinedAxesData, { xDomain, yDomains }, smScales, totalGroupsCount, enableHistogramMode, barsPadding) {
    return (0, canvas_text_bbox_calculator_1.withTextMeasure)((textMeasure) => {
        const panel = (0, panel_utils_1.getPanelSize)(smScales);
        return [...joinedAxesData].reduce((acc, [axisId, { axisSpec, axesStyle, gridLine, isXAxis, labelFormatter: userProvidedLabelFormatter }]) => {
            var _a;
            const { groupId, integersOnly, timeAxisLayerCount } = axisSpec;
            const yDomain = yDomains.find((yd) => yd.groupId === groupId);
            const domain = isXAxis ? xDomain : yDomain;
            const range = axisMinMax(axisSpec.position, chartRotation, panel);
            const maxTickCount = (_a = domain === null || domain === void 0 ? void 0 : domain.desiredTickCount) !== null && _a !== void 0 ? _a : 0;
            const isMultilayerTimeAxis = (domain === null || domain === void 0 ? void 0 : domain.type) === constants_1.ScaleType.Time && timeAxisLayerCount > 0;
            const getMeasuredTicks = (scale, ticks, layer, detailedLayer, labelFormatter, showGrid = true) => {
                const labelBox = (0, compute_axis_ticks_dimensions_1.getLabelBox)(axesStyle, ticks, labelFormatter, textMeasure, axisSpec, gridLine);
                return {
                    ticks: getVisibleTickSet(scale, labelBox, { rotation: chartRotation }, axisSpec, totalGroupsCount, enableHistogramMode, layer, detailedLayer, ticks, labelFormatter, isMultilayerTimeAxis, showGrid),
                    labelBox,
                    scale,
                };
            };
            const getScale = (desiredTickCount) => isXAxis
                ? (0, scales_2.computeXScale)({
                    xDomain: { ...xDomain, desiredTickCount },
                    totalBarsInCluster: totalGroupsCount,
                    range,
                    barsPadding,
                    enableHistogramMode,
                    integersOnly,
                })
                : yDomain && new scales_1.ScaleContinuous({ ...yDomain, range }, { ...yDomain, desiredTickCount, integersOnly });
            const fillLayer = (maxTickCountForLayer) => {
                var _a;
                let fallbackAskedTickCount = 2;
                let fallbackReceivedTickCount = Infinity;
                if (adaptiveTickCount) {
                    let previousActualTickCount = NaN;
                    for (let triedTickCount = maxTickCountForLayer; triedTickCount >= 1; triedTickCount--) {
                        const scale = getScale(triedTickCount);
                        const actualTickCount = (_a = scale === null || scale === void 0 ? void 0 : scale.ticks().length) !== null && _a !== void 0 ? _a : 0;
                        if (!scale || actualTickCount === previousActualTickCount || actualTickCount < 2)
                            continue;
                        const raster = getMeasuredTicks(scale, scale.ticks(), undefined, 0, userProvidedLabelFormatter);
                        const nonZeroLengthTicks = raster.ticks.filter((tick) => tick.label.length > 0);
                        const uniqueLabels = new Set(raster.ticks.map((tick) => tick.label));
                        const areLabelsUnique = raster.ticks.length === uniqueLabels.size;
                        const areAdjacentTimeLabelsUnique = scale.type === constants_1.ScaleType.Time &&
                            !axisSpec.showDuplicatedTicks &&
                            (areLabelsUnique || raster.ticks.every((d, i, a) => { var _a; return i === 0 || d.label !== ((_a = a[i - 1]) === null || _a === void 0 ? void 0 : _a.label); }));
                        const atLeastTwoTicks = uniqueLabels.size >= 2;
                        const allTicksFit = !uniqueLabels.has('');
                        const compliant = axisSpec &&
                            (scale.type === constants_1.ScaleType.Time || atLeastTwoTicks) &&
                            (scale.type === constants_1.ScaleType.Log || allTicksFit) &&
                            ((scale.type === constants_1.ScaleType.Time && (axisSpec.showDuplicatedTicks || areAdjacentTimeLabelsUnique)) ||
                                (scale.type === constants_1.ScaleType.Log
                                    ? new Set(nonZeroLengthTicks.map((tick) => tick.label)).size === nonZeroLengthTicks.length
                                    : areLabelsUnique));
                        previousActualTickCount = actualTickCount;
                        if (raster && compliant) {
                            return {
                                entry: {
                                    ...raster,
                                    ticks: scale.type === constants_1.ScaleType.Log ? raster.ticks : nonZeroLengthTicks,
                                },
                                fallbackAskedTickCount,
                            };
                        }
                        else if (atLeastTwoTicks && uniqueLabels.size <= fallbackReceivedTickCount) {
                            fallbackReceivedTickCount = uniqueLabels.size;
                            fallbackAskedTickCount = triedTickCount;
                        }
                    }
                }
                return { fallbackAskedTickCount };
            };
            if (isMultilayerTimeAxis) {
                const scale = getScale(0);
                if (!scale || !(0, types_1.isContinuousScale)(scale))
                    throw new Error('Scale generation for the multilayer axis failed');
                return acc.set(axisId, (0, multilayer_ticks_1.multilayerAxisEntry)(xDomain, isXAxis && xDomain.isBandScale && enableHistogramMode, range, timeAxisLayerCount, scale, getMeasuredTicks, locale));
            }
            const { fallbackAskedTickCount, entry } = fillLayer(maxTickCount);
            if (entry)
                return acc.set(axisId, entry);
            const scale = getScale(adaptiveTickCount ? fallbackAskedTickCount : maxTickCount);
            const lastResortCandidate = scale && getMeasuredTicks(scale, scale.ticks(), undefined, 0, userProvidedLabelFormatter);
            return lastResortCandidate ? acc.set(axisId, lastResortCandidate) : acc;
        }, new Map());
    });
}
//# sourceMappingURL=visible_ticks.js.map