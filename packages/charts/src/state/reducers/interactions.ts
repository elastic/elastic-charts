/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { produce } from 'immer';

import { getTooltipSpecSelector } from './../selectors/get_tooltip_spec';
import { ChartType } from '../../chart_types';
import { drilldownActive } from '../../chart_types/partition_chart/state/selectors/drilldown_active';
import { getPickedShapesLayerValues } from '../../chart_types/partition_chart/state/selectors/picked_shapes';
import type { LegendItem } from '../../common/legend';
import type { SeriesIdentifier } from '../../common/series_id';
import type { TooltipValue } from '../../specs/tooltip';
import { getDelta } from '../../utils/point';
import { onDOMElementEnter, onDOMElementLeave } from '../actions/dom_element';
import { onKeyPress } from '../actions/key';
import type { ToggleDeselectSeriesAction } from '../actions/legend';
import { onLegendItemOutAction, onLegendItemOverAction, onToggleDeselectSeriesAction } from '../actions/legend';
import { onMouseDown, onMouseUp, onPointerMove } from '../actions/mouse';
import { toggleSelectedTooltipItem, pinTooltip, setSelectedTooltipItems } from '../actions/tooltip';
import type { ChartSliceState } from '../chart_slice_state';
import type { GlobalChartState } from '../chart_state';
import { getInternalIsInitializedSelector, InitStatus } from '../selectors/get_internal_is_intialized';
import { getInternalIsTooltipVisibleSelector } from '../selectors/get_internal_is_tooltip_visible';
import { getInternalTooltipInfoSelector } from '../selectors/get_internal_tooltip_info';
import { getLegendItemsSelector } from '../selectors/get_legend_items';
import { getInitialPointerState } from '../utils/get_initial_pointer_state';
import { getInitialTooltipState } from '../utils/get_initial_tooltip_state';

/** @internal */
function createItemId(item: TooltipValue<any, SeriesIdentifier>) {
  return `${item.seriesIdentifier.key}-${item.label}-${item.value}`;
}

/**
 * The minimum number of pixel between two pointer positions to consider for dragging purposes
 */
const DRAG_DETECTION_PIXEL_DELTA = 4;

/** @internal */
export const handleKeyActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder.addCase(onKeyPress, (globalState, action) => {
    if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
    const state = globalState.interactions;

    if (action.payload === 'Escape') {
      if (state.tooltip.pinned) {
        state.pointer = getInitialPointerState();
        state.tooltip = getInitialTooltipState();
        return;
      }

      state.pointer = getInitialPointerState();
    }
  });
};

/** @internal */
export const handleMouseActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(onPointerMove, (globalState, action) => {
      if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
      const state = globalState.interactions;

      // The dragging is enabled when the delta between down and move positions is greater than a constant.
      // After this initial threshold, the dragging still enabled until the mouse up event
      const dragging =
        state.pointer.dragging ||
        (!!state.pointer.down &&
          getDelta(state.pointer.down.position, action.payload.position) > DRAG_DETECTION_PIXEL_DELTA);

      state.pointer.dragging = dragging;
      state.pointer.current.position = action.payload.position;
      state.pointer.current.time = action.payload.time;
      // Do not update state.pointer.keyPressed here
    })
    .addCase(onMouseDown, (globalState, action) => {
      if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
      const state = globalState.interactions;
      state.prevDrilldown = state.drilldown;
      state.drilldown = getDrilldownData(globalState);
      state.pointer.dragging = false;
      state.pointer.up = null;
      state.pointer.down = {
        position: action.payload.position,
        time: action.payload.time,
      };
      state.pointer.keyPressed = action.payload.keyPressed;
    })
    .addCase(onMouseUp, (globalState, action) => {
      if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
      const state = globalState.interactions;

      state.pointer.lastDrag =
        state.pointer.down && state.pointer.dragging
          ? {
              start: {
                position: {
                  ...state.pointer.down.position,
                },
                time: state.pointer.down.time,
              },
              end: {
                position: {
                  ...state.pointer.current.position,
                },
                time: action.payload.time,
              },
            }
          : null;

      state.pointer.lastClick =
        state.pointer.down && !state.pointer.dragging
          ? {
              position: {
                ...action.payload.position,
              },
              time: action.payload.time,
            }
          : null;

      state.pointer.dragging = false;
      state.pointer.down = null;
      state.pointer.up = {
        position: action.payload.position,
        time: action.payload.time,
      };
      // Do not update state.pointer.keyPressed here
    });
};

/** @internal */
export const handleLegendActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder.addCase(onLegendItemOutAction, (globalState) => {
    if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
    const state = globalState.interactions;

    state.highlightedLegendPath = [];
  });

  builder.addCase(onLegendItemOverAction, (globalState, action) => {
    if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
    const state = globalState.interactions;

    state.highlightedLegendPath = action.payload;
  });

  builder.addCase(onToggleDeselectSeriesAction, (globalState, action) => {
    if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
    const state = globalState.interactions;

    state.deselectedDataSeries = toggleDeselectedDataSeries(
      action.payload,
      state.deselectedDataSeries,
      getLegendItemsSelector(globalState),
    );
  });
};

/** @internal */
export const handleDOMElementActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(onDOMElementEnter, (globalState, action) => {
      if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
      const state = globalState.interactions;

      state.hoveredDOMElement = action.payload;
    })
    .addCase(onDOMElementLeave, (globalState) => {
      if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
      const state = globalState.interactions;

      state.hoveredDOMElement = null;
    });
};

/** @internal */
export const handleTooltipActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  builder
    .addCase(pinTooltip, (globalState, action) => {
      if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
      const state = globalState.interactions;

      if (!action.payload.pinned) {
        if (action.payload.resetPointer) {
          state.pointer = getInitialPointerState();
        } else {
          state.pointer.pinned = null;
        }
        state.tooltip = getInitialTooltipState();
        return;
      }

      const { isPinnable, displayOnly } = getInternalIsTooltipVisibleSelector(globalState);

      if (!isPinnable || displayOnly) {
        return;
      }

      const tooltipSpec = getTooltipSpecSelector(globalState);
      const getSelectedValues = () => {
        const values = getInternalTooltipInfoSelector(globalState)?.values ?? [];
        if (globalState.chartType === ChartType.Heatmap) return values.slice(0, 1); // just use the x value
        return values.filter((v) =>
          // TODO find a better way to distinguish these two
          globalState.chartType === ChartType.XYAxis ? v.isHighlighted : !v.displayOnly,
        );
      };
      const selected =
        // don't pre-populate selection when values are not actionable
        Array.isArray(tooltipSpec.actions) && tooltipSpec.actions.length === 0 ? [] : getSelectedValues();

      state.tooltip.pinned = true;
      state.tooltip.selected = selected;
      state.pointer.pinned = state.pointer.current;
    })
    .addCase(toggleSelectedTooltipItem, (globalState, action) => {
      if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
      const state = globalState.interactions;

      if (!state.tooltip.pinned) return;

      const index = state.tooltip.selected.findIndex((item) => createItemId(item) === createItemId(action.payload));
      if (index !== -1) {
        // deleting from the immutable array using immer's produce
        state.tooltip.selected = produce(state.tooltip.selected, (draft) => {
          draft.splice(index, 1);
        });
      } else {
        state.tooltip.selected.push(action.payload);
      }
    })
    .addCase(setSelectedTooltipItems, (globalState, action) => {
      if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
      const state = globalState.interactions;

      if (!state.tooltip.pinned) return;

      state.tooltip.selected = action.payload;
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
