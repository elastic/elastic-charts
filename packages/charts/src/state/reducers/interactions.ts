/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ChartType } from '../../chart_types';
import { drilldownActive } from '../../chart_types/partition_chart/state/selectors/drilldown_active';
import { getPickedShapesLayerValues as partitionPicks } from '../../chart_types/partition_chart/state/selectors/picked_shapes';
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
import { GlobalChartState, InteractionsState } from '../chart_state';
import { getInitialPointerState } from '../utils';

/**
 * The minimum number of pixel between two pointer positions to consider for dragging purposes
 */
const DRAG_DETECTION_PIXEL_DELTA = 4;

/** @internal */
export function interactionsReducer(
  globalState: GlobalChartState,
  action: LegendActions | MouseActions | KeyActions | DOMElementActions,
  legendItems: LegendItem[],
): InteractionsState {
  const { interactions: state } = globalState;
  console.log(action.type);
  switch (action.type) {
    case ON_KEY_UP:
      if (action.key === 'Escape') {
        return {
          ...state,
          pointer: getInitialPointerState(),
        };
      }

      return state;

    case ON_POINTER_MOVE:
      // enable the dragging flag only if the pixel delta between down and move is greater then 4 pixel
      const dragging =
        !!state.pointer.down && getDelta(state.pointer.down.position, action.position) > DRAG_DETECTION_PIXEL_DELTA;
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
        drilldown: { datumIndex: getDrilldownData(globalState), timestamp: action.time },
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

  // todo consider branch simplifications
  if (negate) {
    return alreadyDeselected || deselectedDataSeries.length !== legendItemsKeys.length - 1
      ? legendItems
          .map(({ seriesIdentifiers }) => seriesIdentifiers)
          .flat()
          .filter(({ key }) => !actionSeriesKeys.includes(key))
      : legendItemIds;
  } else {
    return alreadyDeselected
      ? deselectedDataSeries.filter(({ key }) => !actionSeriesKeys.includes(key))
      : [...deselectedDataSeries, ...legendItemIds];
  }
}

function getDrilldownData(globalState: GlobalChartState): number {
  return globalState.chartType === ChartType.Partition && drilldownActive(globalState)
    ? [...(partitionPicks(globalState)[0] ?? [{ vmIndex: 0 }])].reverse()[0].vmIndex || 0 // vmIndex of the last item, ie. that of the leaf node
    : 0;
}
