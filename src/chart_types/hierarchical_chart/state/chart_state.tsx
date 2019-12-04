import React, { RefObject } from 'react';
import { InternalChartState, BackwardRef } from '../../../state/chart_state';
import { ChartTypes } from '../..';
import { Stage } from 'react-konva';
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
  chartRenderer(containerRef: BackwardRef, forwardStageRef: RefObject<Stage>) {
    return (
      <React.Fragment>
        <Sunburst forwardStageRef={forwardStageRef} />
      </React.Fragment>
    );
  }
  getPointerCursor() {
    return 'default';
  }
}
