/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ActionReducerMapBuilder } from '@reduxjs/toolkit';

import { getTooltipSpecSelector } from './../selectors/get_tooltip_spec';
import { ChartType } from '../../chart_types/chart_type';
import { drilldownActive } from '../../chart_types/partition_chart/state/selectors/drilldown_active';
import { getPickedShapesLayerValues } from '../../chart_types/partition_chart/state/selectors/picked_shapes';
import { LegendItem } from '../../common/legend';
import { SeriesIdentifier } from '../../common/series_id';
import { getDelta } from '../../utils/point';
import { onDOMElementEnter, onDOMElementLeave } from '../actions/dom_element';
import { onKeyPress } from '../actions/key';
import {
  onLegendItemOutAction,
  onLegendItemOverAction,
  onToggleDeselectSeriesAction,
  ToggleDeselectSeriesAction,
} from '../actions/legend';
import { onMouseDown, onMouseUp, onPointerMove } from '../actions/mouse';
import { toggleSelectedTooltipItem, pinTooltip, setSelectedTooltipItems } from '../actions/tooltip';
import { ChartSliceState } from '../chart_slice_state';
import { GlobalChartState } from '../global_chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../selectors/get_internal_is_intialized';
import { getInternalIsTooltipVisibleSelector } from '../selectors/get_internal_is_tooltip_visible';
import { getInternalTooltipInfoSelector } from '../selectors/get_internal_tooltip_info';
import { getLegendItemsSelector } from '../selectors/get_legend_items';
import { getInitialPointerState } from '../utils/get_initial_pointer_state';
import { getInitialTooltipState } from '../utils/get_initial_tooltip_state';

/**
 * The minimum number of pixel between two pointer positions to consider for dragging purposes
 */
const DRAG_DETECTION_PIXEL_DELTA = 4;

/** @internal */
export const handleKeyActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder.addCase(onKeyPress, (state, action) => {
    if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

    if (action.payload === 'Escape') {
      if (state.interactions.tooltip.pinned) {
        state.interactions.pointer = getInitialPointerState();
        state.interactions.tooltip = getInitialTooltipState();
        return;
      }

      state.interactions.pointer = getInitialPointerState();
    }
  });
};

/** @internal */
export const handleMouseActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(onPointerMove, (state, action) => {
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

      // The dragging is enabled when the delta between down and move positions is greater than a constant.
      // After this initial threshold, the dragging still enabled until the mouse up event
      const dragging =
        state.interactions.pointer.dragging ||
        (!!state.interactions.pointer.down &&
          getDelta(state.interactions.pointer.down.position, action.payload.position) > DRAG_DETECTION_PIXEL_DELTA);

      state.interactions.pointer.dragging = dragging;
      state.interactions.pointer.current.position = action.payload.position;
      state.interactions.pointer.current.time = action.payload.time;
    })
    .addCase(onMouseDown, (state, action) => {
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

      state.interactions.prevDrilldown = state.interactions.drilldown;
      state.interactions.drilldown = getDrilldownData(state);
      state.interactions.pointer.dragging = false;
      state.interactions.pointer.up = null;
      state.interactions.pointer.down = {
        position: action.payload.position,
        time: action.payload.time,
      };
    })
    .addCase(onMouseUp, (state, action) => {
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

      state.interactions.pointer.lastDrag =
        state.interactions.pointer.down && state.interactions.pointer.dragging
          ? {
              start: {
                position: {
                  ...state.interactions.pointer.down.position,
                },
                time: state.interactions.pointer.down.time,
              },
              end: {
                position: {
                  ...state.interactions.pointer.current.position,
                },
                time: action.payload.time,
              },
            }
          : null;

      state.interactions.pointer.lastClick =
        state.interactions.pointer.down && !state.interactions.pointer.dragging
          ? {
              position: {
                ...action.payload.position,
              },
              time: action.payload.time,
            }
          : null;

      state.interactions.pointer.dragging = false;
      state.interactions.pointer.down = null;
      state.interactions.pointer.up = {
        position: action.payload.position,
        time: action.payload.time,
      };
    });
};

/** @internal */
export const handleLegendActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder.addCase(onLegendItemOutAction, (state) => {
    if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

    state.interactions.highlightedLegendPath = [];
  });

  builder.addCase(onLegendItemOverAction, (state, action) => {
    if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

    state.interactions.highlightedLegendPath = action.payload;
  });

  builder.addCase(onToggleDeselectSeriesAction, (state, action) => {
    if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

    state.interactions.deselectedDataSeries = toggleDeselectedDataSeries(
      action.payload,
      state.interactions.deselectedDataSeries,
      getLegendItemsSelector(state),
    );
  });
};

/** @internal */
export const handleDOMElementActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(onDOMElementEnter, (state, action) => {
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

      state.interactions.hoveredDOMElement = action.payload;
    })
    .addCase(onDOMElementLeave, (state) => {
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

      state.interactions.hoveredDOMElement = null;
    });
};

/** @internal */
export const handleTooltipActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(pinTooltip, (state, action) => {
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

      if (!action.payload.pinned) {
        if (action.payload.resetPointer) {
          state.interactions.pointer = getInitialPointerState();
        } else {
          state.interactions.pointer.pinned = null;
        }
        state.interactions.tooltip = getInitialTooltipState();
        return;
      }

      const { isPinnable, displayOnly } = getInternalIsTooltipVisibleSelector(state);

      if (!isPinnable || displayOnly) {
        return;
      }

      const tooltipSpec = getTooltipSpecSelector(state);
      const getSelectedValues = () => {
        const values = getInternalTooltipInfoSelector(state)?.values ?? [];
        if (state.chartType === ChartType.Heatmap) return values.slice(0, 1); // just use the x value
        return values.filter((v) =>
          // TODO find a better way to distinguish these two
          state.chartType === ChartType.XYAxis ? v.isHighlighted : !v.displayOnly,
        );
      };
      const selected =
        // don't pre-populate selection when values are not actionable
        Array.isArray(tooltipSpec.actions) && tooltipSpec.actions.length === 0 ? [] : getSelectedValues();

      state.interactions.tooltip.pinned = true;
      state.interactions.tooltip.selected = selected;
      state.interactions.pointer.pinned = state.interactions.pointer.current;
    })
    .addCase(toggleSelectedTooltipItem, (state, action) => {
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

      if (!state.interactions.tooltip.pinned) return;

      let updatedItems = [...state.interactions.tooltip.selected];
      if (updatedItems.includes(action.payload)) {
        updatedItems = updatedItems.filter((item) => item !== action.payload);
      } else {
        updatedItems.push(action.payload);
      }

      state.interactions.tooltip.selected = updatedItems;
    })
    .addCase(setSelectedTooltipItems, (state, action) => {
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) return;

      if (!state.interactions.tooltip.pinned) return;

      state.interactions.tooltip.selected = action.payload;
    });
};

/**
 * Helper functions that currently depend on chart type eg. xy or partition
 */

function toggleDeselectedDataSeries(
  { legendItemIds, metaKey }: ToggleDeselectSeriesAction,
  deselectedDataSeries: SeriesIdentifier[],
  legendItems: LegendItem[],
) {
  const actionSeriesKeys = legendItemIds.map(({ key }) => key);
  const deselectedDataSeriesKeys = new Set(deselectedDataSeries.map(({ key }) => key));
  const legendItemsKeys = legendItems.map(({ seriesIdentifiers }) => seriesIdentifiers);

  const alreadyDeselected = actionSeriesKeys.every((key) => deselectedDataSeriesKeys.has(key));
  const keepOnlyNonActionSeries = ({ key }: SeriesIdentifier) => !actionSeriesKeys.includes(key);

  // when a meta key (CTRL or Mac Cmd ⌘) add or remove the clicked item from the visible list
  if (metaKey) {
    return alreadyDeselected
      ? deselectedDataSeries.filter(keepOnlyNonActionSeries)
      : deselectedDataSeries.concat(legendItemIds);
  }
  // when a hidden series is clicked, make it visible
  if (alreadyDeselected) {
    return deselectedDataSeries.filter(keepOnlyNonActionSeries);
  }
  // if the clicked item is the only visible series, make all series visible (reset)
  if (deselectedDataSeries.length === legendItemsKeys.length - 1) {
    return [];
  }
  // at this point either a visible series was clicked:
  // * if there's at least one hidden series => add it to the hidden list
  // * otherwise hide everything but the clicked item (isolate it)
  return deselectedDataSeries.length
    ? deselectedDataSeries.concat(legendItemIds)
    : legendItemsKeys.flat().filter(keepOnlyNonActionSeries);
}

function getDrilldownData(globalState: GlobalChartState) {
  if (globalState.chartType !== ChartType.Partition || !drilldownActive(globalState)) {
    return [];
  }
  const layerValues = getPickedShapesLayerValues(globalState)[0];
  return layerValues ? layerValues.at(-1)?.path.map((n) => n.value) ?? [] : [];
}
