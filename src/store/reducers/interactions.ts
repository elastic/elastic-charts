import { CursorPositionChangeAction, ON_CURSOR_POSITION_CHANGE } from '../actions/cursor';
import { InteractionsStore } from '../chart_store';
import {
  ToggleLegendAction,
  LegendItemOutAction,
  LegendItemOverAction,
  ToggleDeselectSeriesAction,
  ON_TOGGLE_LEGEND,
  ON_LEGEND_ITEM_OUT,
  ON_LEGEND_ITEM_OVER,
  ON_TOGGLE_DESELECT_SERIES,
  ON_INVERT_DESELECT_SERIES,
  InvertDeselectSeriesAction,
} from 'store/actions/legend';
import { ON_MOUSE_DOWN, ON_MOUSE_UP, MouseDownAction, MouseUpAction } from '../actions/mouse';
import { DataSeriesColorsValues, findDataSeriesByColorValues } from 'chart_types/xy_chart/utils/series';

export function interactionsReducer(
  state: InteractionsStore,
  action:
    | CursorPositionChangeAction
    | ToggleLegendAction
    | LegendItemOutAction
    | LegendItemOverAction
    | ToggleDeselectSeriesAction
    | InvertDeselectSeriesAction
    | MouseDownAction
    | MouseUpAction,
): InteractionsStore {
  switch (action.type) {
    case ON_CURSOR_POSITION_CHANGE:
      const { x, y } = action;

      // allow going outside container if mouse down is pressed
      if (Boolean(state.mouseDownPosition) && x === -1 && y === -1) {
        return state;
      }
      return {
        ...state,
        rawCursorPosition: {
          x,
          y,
        },
      };
    case ON_MOUSE_DOWN:
      return {
        ...state,
        mouseDownPosition: action.point,
      };
    case ON_MOUSE_UP: {
      return {
        ...state,
        mouseDownPosition: null,
      };
    }
    case ON_TOGGLE_LEGEND:
      return {
        ...state,
        legendCollapsed: !state.legendCollapsed,
      };
    case ON_LEGEND_ITEM_OUT:
      return {
        ...state,
        highlightedLegendItemKey: null,
      };
    case ON_LEGEND_ITEM_OVER:
      return {
        ...state,
        highlightedLegendItemKey: action.legendItemKey,
      };
    case ON_TOGGLE_DESELECT_SERIES:
      return {
        ...state,
        deselectedDataSeries: toggleDeselectedDataSeries(action.legendItemId, state.deselectedDataSeries),
      };
    case ON_INVERT_DESELECT_SERIES:
      return {
        ...state,
        invertDeselect: true,
        deselectedDataSeries: toggleDeselectedDataSeries(action.legendItemId, state.deselectedDataSeries),
      };
    default:
      return state;
  }
}

function toggleDeselectedDataSeries(
  legendItem: DataSeriesColorsValues,
  deselectedDataSeries: DataSeriesColorsValues[],
) {
  const index = findDataSeriesByColorValues(deselectedDataSeries, legendItem);
  if (index > -1) {
    return [...deselectedDataSeries.slice(0, index), ...deselectedDataSeries.slice(index + 1)];
  } else {
    return [...deselectedDataSeries, legendItem];
  }
}
