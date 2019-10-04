import { SPEC_PARSED, SPEC_UNMOUNTED } from './actions/specs';
import { specsReducer } from './reducers/specs';
import { chartSettingsReducer } from './reducers/chart_settings';
import { interactionsReducer } from './reducers/interactions';
import { ChartTypes } from '../chart_types';
import { PieChartState } from '../chart_types/pie_chart/state/chart_state';
import { XYAxisChartState } from '../chart_types/xy_chart/state/chart_state';
import { DataSeriesColorsValues } from '../chart_types/xy_chart/utils/series';
import { Spec } from '../specs';
import { DEFAULT_SETTINGS_SPEC } from '../specs/settings';
import { Dimensions } from '../utils/dimensions';
import { Point } from '../utils/point';
import { LegendItem } from 'chart_types/xy_chart/legend/legend';
import { TooltipLegendValue } from 'chart_types/xy_chart/tooltip/tooltip';

export type GetCustomChartComponent = (componentType: 'dom' | 'svg' | 'canvas', zIndex: number) => JSX.Element | null;
export interface InternalChartState {
  chartType: ChartType;
  chartRenderer(globalState: GlobalChartState): JSX.Element | null;
  getChartDimensions(globalState: GlobalChartState): Dimensions;
  isBrushAvailable(globalState: GlobalChartState): boolean;
  isChartEmpty(globalState: GlobalChartState): boolean;
  getLegendItems(globalState: GlobalChartState): Map<string, LegendItem>;
  getLegendItemsValues(globalState: GlobalChartState): Map<string, TooltipLegendValue>;
}

export interface SpecList {
  [specId: string]: Spec;
}
export interface GlobalSettings {
  debug: boolean;
  parentDimensions: Dimensions;
}
export interface PointerState {
  down: {
    position: Point;
    time: number;
  } | null;
  up: {
    position: Point;
    time: number;
  } | null;
}

export interface InteractionsState {
  rawCursorPosition: Point;
  pointer: PointerState;
  highlightedLegendItemKey: string | null;
  legendCollapsed: boolean;
  invertDeselect: boolean;
  deselectedDataSeries: DataSeriesColorsValues[];
}

export interface GlobalChartState {
  chartId: string;
  initialized: boolean;
  specs: SpecList;
  chartType: ChartType | null;
  internalChartState: InternalChartState | null;
  settings: GlobalSettings;
  interactions: InteractionsState;
}

export type ChartType = typeof ChartTypes.Pie | typeof ChartTypes.XYAxis | typeof ChartTypes.Global;

const getInitialState = (chartId: string): GlobalChartState => ({
  chartId,
  initialized: false,
  specs: {
    [DEFAULT_SETTINGS_SPEC.id]: DEFAULT_SETTINGS_SPEC,
  },
  chartType: null,
  internalChartState: null,
  interactions: {
    rawCursorPosition: {
      x: -1,
      y: -1,
    },
    pointer: {
      down: null,
      up: null,
    },
    legendCollapsed: false,
    highlightedLegendItemKey: null,
    deselectedDataSeries: [],
    invertDeselect: false,
  },
  settings: {
    debug: false,
    parentDimensions: {
      height: 0,
      width: 0,
      left: 0,
      top: 0,
    },
  },
});

export const chartStoreReducer = (chartId: string) => {
  const initialState = getInitialState(chartId);
  return (state = initialState, action: any): GlobalChartState => {
    switch (action.type) {
      case SPEC_PARSED:
        const chartType = findMainChartType(state.specs);

        if (isChartTypeChanged(state, chartType)) {
          const internalChartState = initInternalChartState(chartType);
          return {
            ...state,
            initialized: true,
            chartType,
            internalChartState,
          };
        } else {
          return {
            ...state,
            initialized: true,
            chartType,
          };
        }
      case SPEC_UNMOUNTED:
        return {
          ...state,
          initialized: false,
        };
      default:
        return {
          ...state,
          specs: specsReducer(state.specs, action),
          settings: chartSettingsReducer(state.settings, action),
          interactions: interactionsReducer(state.interactions, action),
        };
    }
  };
};

function findMainChartType(specs: SpecList) {
  const types = Object.keys(specs).reduce<{
    [chartType: string]: number;
  }>((acc, specId) => {
    const { chartType } = specs[specId];
    if (!acc[chartType]) {
      acc[chartType] = 0;
    }
    acc[chartType] = acc[chartType] + 1;
    return acc;
  }, {});
  const chartTypes = Object.keys(types).filter((type) => type !== 'global');
  if (chartTypes.length > 1) {
    console.warn('Multiple chart type on the same configuration');
    return null;
  } else {
    return chartTypes[0] as ChartType;
  }
}

function initInternalChartState(chartType: ChartType | null): InternalChartState | null {
  // console.log(`initializing ${chartType}`);
  switch (chartType) {
    case 'pie':
      return new PieChartState();
    case 'xy_axis':
      return new XYAxisChartState();
    default:
      return null;
  }
}

function isChartTypeChanged(state: GlobalChartState, newChartType: ChartType | null) {
  return state.chartType !== newChartType;
}
