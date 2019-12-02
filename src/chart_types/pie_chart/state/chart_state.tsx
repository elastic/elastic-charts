import React, { RefObject } from 'react';
import { InternalChartState, BackwardRef } from '../../../state/chart_state';
import { ChartTypes } from '../..';
import { Stage } from 'react-konva';
import { PieChart } from '../renderer/canvas/pie_chart';

const EMPTY_MAP = new Map();
export class PieChartState implements InternalChartState {
  chartType = ChartTypes.Pie;
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
  chartRenderer(containerRef: BackwardRef, forwardStageRef: RefObject<Stage>) {
    return (
      <React.Fragment>
        <PieChart forwardStageRef={forwardStageRef} />
      </React.Fragment>
    );
  }
  getPointerCursor() {
    return 'default';
  }
}
