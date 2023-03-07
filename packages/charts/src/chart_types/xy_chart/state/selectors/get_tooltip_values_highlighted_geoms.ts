/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getComputedScalesSelector } from './get_computed_scales';
import { getElementAtCursorPositionSelector } from './get_elements_at_cursor_pos';
import { getOrientedProjectedPointerPositionSelector } from './get_oriented_projected_pointer_position';
import { getProjectedPointerPositionSelector } from './get_projected_pointer_position';
import { getSiDataSeriesMapSelector } from './get_si_dataseries_map';
import { getSeriesSpecsSelector, getAxisSpecsSelector } from './get_specs';
import { hasSingleSeriesSelector } from './has_single_series';
import { TooltipInfo } from '../../../../components/tooltip/types';
import {
  PointerEvent,
  isPointerOutEvent,
  TooltipValue,
  isFollowTooltipType,
  SettingsSpec,
  getTooltipType,
  TooltipSpec,
} from '../../../../specs';
import { TooltipType } from '../../../../specs/constants';
import { GlobalChartState } from '../../../../state/chart_state';
import { createCustomCachedSelector } from '../../../../state/create_selector';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { getTooltipInteractionState } from '../../../../state/selectors/get_tooltip_interaction_state';
import { getTooltipSpecSelector } from '../../../../state/selectors/get_tooltip_spec';
import { isNil, Rotation } from '../../../../utils/common';
import { isValidPointerOverEvent } from '../../../../utils/events';
import { IndexedGeometry } from '../../../../utils/geometry';
import { Point } from '../../../../utils/point';
import { getTooltipCompareFn } from '../../../../utils/series_sort';
import { isPointOnGeometry } from '../../rendering/utils';
import { formatTooltip } from '../../tooltip/tooltip';
import { defaultXYLegendSeriesSort } from '../../utils/default_series_sort_fn';
import { DataSeries } from '../../utils/series';
import { BasicSeriesSpec, AxisSpec } from '../../utils/specs';
import { getAxesSpecForSpecId, getSpecDomainGroupId, getSpecsById } from '../utils/spec';
import { ComputedScales } from '../utils/types';

const EMPTY_VALUES = Object.freeze({
  tooltip: {
    header: null,
    values: [],
  },
  highlightedGeometries: [],
});

/** @internal */
export interface TooltipAndHighlightedGeoms {
  tooltip: TooltipInfo;
  highlightedGeometries: IndexedGeometry[];
}

const getExternalPointerEventStateSelector = (state: GlobalChartState) => state.externalEvents.pointer;

/** @internal */
export const getTooltipInfoAndGeomsSelector = createCustomCachedSelector(
  [
    getSeriesSpecsSelector,
    getAxisSpecsSelector,
    getSettingsSpecSelector,
    getProjectedPointerPositionSelector,
    getOrientedProjectedPointerPositionSelector,
    getChartRotationSelector,
    hasSingleSeriesSelector,
    getComputedScalesSelector,
    getElementAtCursorPositionSelector,
    getSiDataSeriesMapSelector,
    getExternalPointerEventStateSelector,
    getTooltipSpecSelector,
  ],
  getTooltipAndHighlightFromValue,
);

function getTooltipAndHighlightFromValue(
  seriesSpecs: BasicSeriesSpec[],
  axesSpecs: AxisSpec[],
  settings: SettingsSpec,
  projectedPointerPosition: Point,
  orientedProjectedPointerPosition: Point,
  chartRotation: Rotation,
  hasSingleSeries: boolean,
  scales: ComputedScales,
  matchingGeoms: IndexedGeometry[],
  serialIdentifierDataSeriesMap: Record<string, DataSeries>,
  externalPointerEvent: PointerEvent | null,
  tooltip: TooltipSpec,
): TooltipAndHighlightedGeoms {
  if (!scales.xScale || !scales.yScales) {
    return EMPTY_VALUES;
  }

  let { x, y } = orientedProjectedPointerPosition;
  let tooltipType = getTooltipType(tooltip, settings);
  if (isValidPointerOverEvent(scales.xScale, externalPointerEvent)) {
    tooltipType = getTooltipType(tooltip, settings, true);
    if (isNil(externalPointerEvent.x)) {
      return EMPTY_VALUES;
    }
    const scaledX = scales.xScale.pureScale(externalPointerEvent.x);

    if (Number.isNaN(scaledX)) {
      return EMPTY_VALUES;
    }

    x = scaledX;
    y = 0;
  } else if (projectedPointerPosition.x === -1 || projectedPointerPosition.y === -1) {
    return EMPTY_VALUES;
  }

  if (tooltipType === TooltipType.None && !externalPointerEvent) {
    return EMPTY_VALUES;
  }

  if (matchingGeoms.length === 0) {
    return EMPTY_VALUES;
  }

  // build the tooltip value list
  let header: TooltipValue | null = null;
  const highlightedGeometries: IndexedGeometry[] = [];
  const xValues = new Set<any>();
  const hideNullValues = !tooltip.showNullValues;
  const values = matchingGeoms.reduce<TooltipValue[]>((acc, indexedGeometry) => {
    if (hideNullValues && indexedGeometry.value.y === null) {
      return acc;
    }
    const {
      seriesIdentifier: { specId },
    } = indexedGeometry;
    const spec = getSpecsById<BasicSeriesSpec>(seriesSpecs, specId);

    // safe guard check
    if (!spec) {
      return acc;
    }
    const { xAxis, yAxis } = getAxesSpecForSpecId(axesSpecs, spec.groupId, chartRotation);

    // yScales is ensured by the enclosing if
    const yScale = scales.yScales.get(getSpecDomainGroupId(spec));
    if (!yScale) {
      return acc;
    }

    // check if the pointer is on the geometry (avoid checking if using external pointer event)
    let isHighlighted = false;
    if (
      (!externalPointerEvent || isPointerOutEvent(externalPointerEvent)) &&
      isPointOnGeometry(x, y, indexedGeometry, settings.pointBuffer)
    ) {
      isHighlighted = true;
      highlightedGeometries.push(indexedGeometry);
    }

    // if it's a follow tooltip, and no element is highlighted
    // do _not_ add element into tooltip list
    if (!isHighlighted && isFollowTooltipType(tooltipType)) {
      return acc;
    }

    // format the tooltip values
    const formattedTooltip = formatTooltip(indexedGeometry, spec, false, isHighlighted, hasSingleSeries, yAxis);

    // format only one time the x value
    if (!header) {
      // if we have a tooltipHeaderFormatter, then don't pass in the xAxis as the user will define a formatter
      const formatterAxis = tooltip.headerFormatter ? undefined : xAxis;
      header = formatTooltip(indexedGeometry, spec, true, false, hasSingleSeries, formatterAxis);
    }

    xValues.add(indexedGeometry.value.x);

    return [...acc, formattedTooltip];
  }, []);

  if (values.length > 1 && xValues.size === values.length) {
    // TODO: remove after tooltip redesign
    header = null;
  }

  const tooltipSortFn = getTooltipCompareFn((a, b) => {
    const aDs = serialIdentifierDataSeriesMap[a.key];
    const bDs = serialIdentifierDataSeriesMap[b.key];
    return defaultXYLegendSeriesSort(aDs, bDs);
  });

  const sortedTooltipValues = values.sort((a, b) => {
    return tooltipSortFn(a.seriesIdentifier, b.seriesIdentifier);
  });
  return {
    tooltip: {
      header,
      // to avoid creating a breaking change because of a different sorting order on tooltip
      values: sortedTooltipValues,
    },
    highlightedGeometries,
  };
}

/** @internal */
export const getHighlightedTooltipTooltipValuesSelector = createCustomCachedSelector(
  [getTooltipInteractionState, getTooltipInfoAndGeomsSelector, getTooltipSpecSelector, getSettingsSpecSelector],
  ({ pinned }, values, tooltip, settings): TooltipAndHighlightedGeoms => {
    const tooltipType = getTooltipType(tooltip, settings);
    const highlightedValues = values.tooltip.values.filter((v) => v.isHighlighted);
    const hasTooltipContent = values.tooltip.values.length > tooltip.maxTooltipItems && highlightedValues.length > 0;

    if (!pinned && (isFollowTooltipType(tooltipType) || hasTooltipContent)) {
      return {
        ...values,
        tooltip: {
          ...values.tooltip,
          values: highlightedValues,
        },
      };
    }
    return values;
  },
);

/** @internal */
export const getTooltipInfoSelector = createCustomCachedSelector(
  [getHighlightedTooltipTooltipValuesSelector],
  ({ tooltip }): TooltipInfo => tooltip,
);

/** @internal */
export const getHighlightedGeomsSelector = createCustomCachedSelector(
  [getHighlightedTooltipTooltipValuesSelector],
  ({ highlightedGeometries }): IndexedGeometry[] => highlightedGeometries,
);
