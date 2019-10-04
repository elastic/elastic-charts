import React from 'react';
import { InternalChartState, GlobalChartState } from '../../../state/chart_state';
import { ChartTypes } from '../..';
import { ReactiveChart } from '../rendereres/canvas/renderer';
import { TooltipLegendValue } from 'chart_types/xy_chart/tooltip/tooltip';
import { LegendItem } from 'chart_types/xy_chart/legend/legend';

const legendItemsValues = new Map<string, TooltipLegendValue>();
const legendItems = new Map<string, LegendItem>();
legendItems.set('aaa', {
  key: 'aaa',
  color: 'red',
  label: 'aaa',
  value: {
    specId: 'aaa',
    colorValues: [],
  },
  isSeriesVisible: true,
  isLegendItemVisible: true,
  displayValue: {
    raw: { y0: null, y1: 1 },
    formatted: {
      y0: null,
      y1: '111',
    },
  },
});

export class PieChartState implements InternalChartState {
  chartType = ChartTypes.Pie;
  getChartDimensions(state: GlobalChartState) {
    return state.settings.parentDimensions;
  }
  chartRenderer() {
    return <ReactiveChart />;
  }
  isBrushAvailable() {
    return false;
  }
  isChartEmpty() {
    return false;
  }
  getLegendItems() {
    return legendItems;
  }
  getLegendItemsValues(): Map<string, TooltipLegendValue> {
    return legendItemsValues;
  }
}
