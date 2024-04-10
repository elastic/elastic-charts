/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getTooltipSpecSelector } from './../selectors/get_tooltip_spec';
import { ChartType } from '../../chart_types';
import { drilldownActive } from '../../chart_types/partition_chart/state/selectors/drilldown_active';
import { getPickedShapesLayerValues } from '../../chart_types/partition_chart/state/selectors/picked_shapes';
import { LegendItem } from '../../common/legend';
import { SeriesIdentifier } from '../../common/series_id';
import { getDelta } from '../../utils/point';
import { DOMElementActions, ON_DOM_ELEMENT_ENTER, ON_DOM_ELEMENT_LEAVE } from '../actions/dom_element';
import { KeyActions, ON_KEY_UP } from '../actions/key';
import {
  LegendActions,
  ON_LEGEND_ITEM_OUT,
  ON_LEGEND_ITEM_OVER,
  ON_TOGGLE_DESELECT_SERIES,
  ToggleDeselectSeriesAction,
} from '../actions/legend';
import { MouseActions, ON_MOUSE_DOWN, ON_MOUSE_UP, ON_POINTER_MOVE } from '../actions/mouse';
import {
  TOGGLE_SELECTED_TOOLTIP_ITEM,
  PIN_TOOLTIP,
  TooltipActions,
  SET_SELECTED_TOOLTIP_ITEMS,
} from '../actions/tooltip';
import { GlobalChartState, InteractionsState } from '../chart_state';
import { getInternalIsTooltipVisibleSelector } from '../selectors/get_internal_is_tooltip_visible';
import { getInternalTooltipInfoSelector } from '../selectors/get_internal_tooltip_info';
import { getInitialPointerState, getInitialTooltipState } from '../utils';

/**
 * The minimum number of pixel between two pointer positions to consider for dragging purposes
 */
const DRAG_DETECTION_PIXEL_DELTA = 4;

/** @internal */
export function interactionsReducer(
  globalState: GlobalChartState,
  action: LegendActions | MouseActions | KeyActions | DOMElementActions | TooltipActions,
  legendItems: LegendItem[],
): InteractionsState {
  const { interactions: state } = globalState;
  switch (action.type) {
    case ON_KEY_UP:
      if (action.key === 'Escape') {
        if (state.tooltip.pinned) {
          return {
            ...state,
            pointer: getInitialPointerState(),
            tooltip: getInitialTooltipState(),
          };
        }

        return {
          ...state,
          pointer: getInitialPointerState(),
        };
      }

      return state;

    case ON_POINTER_MOVE:
      // The dragging is enabled when the delta between down and move positions is greater than a constant.
      // After this initial threshold, the dragging still enabled until the mouse up event
      const dragging =
        state.pointer.dragging ||
        (!!state.pointer.down && getDelta(state.pointer.down.position, action.position) > DRAG_DETECTION_PIXEL_DELTA);
      return {
        ...state,
        pointer: {
          ...state.pointer,
          dragging,
          current: {
            position: {
              ...action.position,
            },
            time: action.time,
          },
        },
      };

    case ON_MOUSE_DOWN:
      return {
        ...state,
        drilldown: getDrilldownData(globalState),
        prevDrilldown: state.drilldown,
        pointer: {
          ...state.pointer,
          dragging: false,
          up: null,
          down: {
            position: {
              ...action.position,
            },
            time: action.time,
          },
        },
      };

    case ON_MOUSE_UP: {
      return {
        ...state,
        pointer: {
          ...state.pointer,
          lastDrag:
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
                    time: action.time,
                  },
                }
              : null,
          lastClick:
            state.pointer.down && !state.pointer.dragging
              ? {
                  position: {
                    ...action.position,
                  },
                  time: action.time,
                }
              : null,
          dragging: false,
          down: null,
          up: {
            position: {
              ...action.position,
            },
            time: action.time,
          },
        },
      };
    }

    case ON_LEGEND_ITEM_OUT:
      return {
        ...state,
        highlightedLegendPath: [],
      };

    case ON_LEGEND_ITEM_OVER:
      const { legendPath: highlightedLegendPath } = action;
      return {
        ...state,
        highlightedLegendPath,
      };

    case ON_TOGGLE_DESELECT_SERIES:
      return {
        ...state,
        deselectedDataSeries: toggleDeselectedDataSeries(action, state.deselectedDataSeries, legendItems),
      };

    case ON_DOM_ELEMENT_ENTER:
      return {
        ...state,
        hoveredDOMElement: action.element,
      };

    case ON_DOM_ELEMENT_LEAVE:
      return {
        ...state,
        hoveredDOMElement: null,
      };

    case PIN_TOOLTIP: {
      if (!action.pinned) {
        return {
          ...state,
          pointer: action.resetPointer
            ? getInitialPointerState()
            : {
                ...state.pointer,
                pinned: null,
              },
          tooltip: getInitialTooltipState(),
        };
      }

      const { isPinnable, displayOnly } = getInternalIsTooltipVisibleSelector(globalState);

      if (!isPinnable || displayOnly) {
        return state;
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

      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          pinned: true,
          selected,
        },
        pointer: {
          ...state.pointer,
          pinned: state.pointer.current,
        },
      };
    }

    case TOGGLE_SELECTED_TOOLTIP_ITEM: {
      if (!state.tooltip.pinned) return state;
      let updatedItems = [...state.tooltip.selected];
      if (updatedItems.includes(action.item)) {
        updatedItems = updatedItems.filter((item) => item !== action.item);
      } else {
        updatedItems.push(action.item);
      }

      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          selected: updatedItems,
        },
      };
    }

    case SET_SELECTED_TOOLTIP_ITEMS: {
      if (!state.tooltip.pinned) return state;

      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          selected: action.items,
        },
      };
    }

    default:
      return state;
  }
}

/**
 * Helper functions that currently depend on chart type eg. xy or partition
 */

function toggleDeselectedDataSeries(
  { legendItemIds, negate }: ToggleDeselectSeriesAction,
  deselectedDataSeries: SeriesIdentifier[],
  legendItems: LegendItem[],
) {
  const actionSeriesKeys = legendItemIds.map(({ key }) => key);
  const deselectedDataSeriesKeys = new Set(deselectedDataSeries.map(({ key }) => key));
  const legendItemsKeys = legendItems.map(({ seriesIdentifiers }) => seriesIdentifiers);

  const alreadyDeselected = actionSeriesKeys.every((key) => deselectedDataSeriesKeys.has(key));

  const keepOnlyNonActionSeries = ({ key }: SeriesIdentifier) => !actionSeriesKeys.includes(key);

  if (negate) {
    return alreadyDeselected
      ? deselectedDataSeries.filter(keepOnlyNonActionSeries)
      : deselectedDataSeries.concat(legendItemIds);
  }
  if (alreadyDeselected) {
    return deselectedDataSeries.filter(keepOnlyNonActionSeries);
  }
  if (deselectedDataSeries.length === legendItemsKeys.length - 1) {
    return [];
  }
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
