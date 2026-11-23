/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Action, ActionReducerMapBuilder, Draft } from '@reduxjs/toolkit';
import { isDraft, original } from '@reduxjs/toolkit';

import { ChartType } from '../../chart_types';
import { drilldownActive } from '../../chart_types/partition_chart/state/selectors/drilldown_active';
import { getPickedShapesLayerValues } from '../../chart_types/partition_chart/state/selectors/picked_shapes';
import type { LegendItem } from '../../common/legend';
import type { SeriesIdentifier } from '../../common/series_id';
import type { TooltipValue } from '../../specs/tooltip';
import { noModifierKeysPressed } from '../../utils/keys';
import { getDelta } from '../../utils/point';
import { onDOMElementEnter, onDOMElementLeave } from '../actions/dom_element';
import { onKeyPress } from '../actions/key';
import type { ToggleDeselectSeriesAction } from '../actions/legend';
import { onLegendItemOutAction, onLegendItemOverAction, onToggleDeselectSeriesAction } from '../actions/legend';
import { onMouseDown, onMouseUp, onPointerMove } from '../actions/mouse';
import { toggleSelectedTooltipItem, pinTooltip, setSelectedTooltipItems } from '../actions/tooltip';
import type { ChartSliceState } from '../chart_slice_state';
import type { GlobalChartState } from '../chart_state';
import type { InteractionsState } from '../interactions_state';
import { isPinnableTooltip } from '../selectors/can_pin_tooltip';
import { getInternalIsInitializedSelector, InitStatus } from '../selectors/get_internal_is_intialized';
import { getInternalTooltipInfoSelector } from '../selectors/get_internal_tooltip_info';
import { getLegendItemsSelector } from '../selectors/get_legend_items';
import { getTooltipSpecSelector } from '../selectors/get_tooltip_spec';
import { getInitialPointerState } from '../utils/get_initial_pointer_state';
import { getInitialTooltipState } from '../utils/get_initial_tooltip_state';

/** A reducer of interactions gets the interactions to write to, the action, and the state to ask selectors about */
type InteractionsReducer<A> = (state: Draft<InteractionsState>, action: A, globalState: GlobalChartState) => void;

/**
 * Adds reducers of interactions. Each writes to the draft of the interactions alone, and asks selectors about
 * the state the store holds, never about a draft. `isDraft` and `original` must be those of the toolkit.
 */
function interactions(builder: ActionReducerMapBuilder<ChartSliceState>) {
  const reducers = {
    addCase<C extends ((...args: any[]) => Action) & { type: string }>(
      actionCreator: C,
      reducer: InteractionsReducer<ReturnType<C>>,
    ) {
      builder.addCase(actionCreator, (draft, action) => {
        const globalState = isDraft(draft) ? original(draft) ?? draft : draft;
        if (getInternalIsInitializedSelector(globalState) !== InitStatus.Initialized) return;
        reducer(draft.interactions, action, globalState);
      });
      return reducers;
    },
  };
  return reducers;
}

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
  interactions(builder).addCase(onKeyPress, (state, action) => {
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
  interactions(builder)
    .addCase(onPointerMove, (state, action) => {
      // The dragging is enabled when the delta between down and move positions is greater than a constant.
      // After this initial threshold, the dragging still enabled until the mouse up event
      const dragging =
        state.pointer.dragging ||
        (!!state.pointer.down &&
          getDelta(state.pointer.down.position, action.payload.position) > DRAG_DETECTION_PIXEL_DELTA);

      state.pointer.dragging = dragging;
      state.pointer.current.position = action.payload.position;
      state.pointer.current.time = action.payload.time;
      // Do not update state.pointer.keyPressed here, only the mouseDown event should store the pressed keys
    })
    .addCase(onMouseDown, (state, action, globalState) => {
      state.prevDrilldown = state.drilldown;
      state.drilldown = getDrilldownData(globalState);
      state.pointer.dragging = false;
      state.pointer.up = null;
      state.pointer.down = {
        position: action.payload.position,
        time: action.payload.time,
      };
      state.pointer.keyPressed = action.payload.keyPressed ?? noModifierKeysPressed;
    })
    .addCase(onMouseUp, (state, action) => {
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
      // Do not update state.pointer.keyPressed here, only the mouseDown event should store the pressed keys
    });
};

/** @internal */
export const handleLegendActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  interactions(builder).addCase(onLegendItemOutAction, (state) => {
    state.highlightedLegendPath = null;
  });

  interactions(builder).addCase(onLegendItemOverAction, (state, action) => {
    state.highlightedLegendPath = action.payload;
  });

  interactions(builder).addCase(onToggleDeselectSeriesAction, (state, action, globalState) => {
    state.deselectedDataSeries = toggleDeselectedDataSeries(
      action.payload,
      state.deselectedDataSeries,
      getLegendItemsSelector(globalState),
    );
  });
};

/** @internal */
export const handleDOMElementActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  interactions(builder)
    .addCase(onDOMElementEnter, (state, action) => {
      state.hoveredDOMElement = action.payload;
    })
    .addCase(onDOMElementLeave, (state) => {
      state.hoveredDOMElement = null;
    });
};

/** @internal */
export const handleTooltipActions = (builder: ActionReducerMapBuilder<ChartSliceState>) => {
  interactions(builder)
    .addCase(pinTooltip, (state, action, globalState) => {
      if (!action.payload.pinned) {
        if (action.payload.resetPointer) {
          state.pointer = getInitialPointerState();
        } else {
          state.pointer.pinned = null;
        }
        state.tooltip = getInitialTooltipState();
        return;
      }

      if (!isPinnableTooltip(globalState)) {
        return;
      }

      const tooltipSpec = getTooltipSpecSelector(globalState);
      const getSelectedValues = () => {
        const values = getInternalTooltipInfoSelector(globalState)?.values ?? [];
        if (globalState.chartType === ChartType.Heatmap) return values.slice(0, 1); // just use the x value
        return values.filter((v) => {
          if (!v.isVisible) {
            return false;
          }
          // TODO find a better way to distinguish these two
          if (globalState.chartType === ChartType.XYAxis) {
            return v.isHighlighted;
          }
          return !v.displayOnly;
        });
      };
      const selected =
        // don't pre-populate selection when values are not actionable
        Array.isArray(tooltipSpec.actions) && tooltipSpec.actions.length === 0 ? [] : getSelectedValues();

      state.tooltip.pinned = true;
      state.tooltip.selected = selected;
      state.pointer.pinned = state.pointer.current;
    })
    .addCase(toggleSelectedTooltipItem, (state, action) => {
      if (!state.tooltip.pinned) return;

      const index = state.tooltip.selected.findIndex((item) => createItemId(item) === createItemId(action.payload));
      if (index !== -1) {
        state.tooltip.selected.splice(index, 1);
      } else {
        state.tooltip.selected.push(action.payload);
      }
    })
    .addCase(setSelectedTooltipItems, (state, action) => {
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
  legendItems: ReadonlyArray<LegendItem>,
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
