import React from 'react';
import { InternalChartState } from '../../../state/chart_state';
import { ChartTypes } from '../..';
import { Sunburst } from '../renderer/canvas/sunburst';

const EMPTY_MAP = new Map();
export class SunburstState implements InternalChartState {
  chartType = ChartTypes.Sunburst;
  isBrushAvailable() {
    return false;
  }
  isBrushing() {
    return false;
  }
  isChartEmpty() {
    return false;
  }
  getLegendItems() {
    return EMPTY_MAP;
  }
  getLegendItemsValues() {
    return EMPTY_MAP;
  }
  chartRenderer() {
    return (
      <React.Fragment>
        <Sunburst />
      </React.Fragment>
    );
  }
  getPointerCursor() {
    return 'default';
  }
}
