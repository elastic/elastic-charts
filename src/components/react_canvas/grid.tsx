import React from 'react';
import { Group, Line } from 'react-konva';
import {
  AxisTick, AxisTicksDimensions, getHorizontalAxisGridLineProps, getVerticalAxisGridLineProps,
  isVertical, mergeWithDefaultGridLineConfig,
} from '../../lib/axes/axis_utils';
import { AxisSpec } from '../../lib/series/specs';
import { DEFAULT_GRID_LINE_CONFIG, Theme } from '../../lib/themes/theme';
import { Dimensions } from '../../lib/utils/dimensions';

interface GridProps {
  chartTheme: Theme;
  axisSpec: AxisSpec;
  axisTicksDimensions: AxisTicksDimensions;
  axisPosition: Dimensions;
  ticks: AxisTick[];
  debug: boolean;
  chartDimensions: Dimensions;
}

export class Grid extends React.PureComponent<GridProps> {
  render() {
    return this.renderGrid();
  }
  private renderGridLine = (tick: AxisTick, i: number) => {
    const showGridLines = this.props.axisSpec.showGridLines || false;

    if (!showGridLines) {
      return null;
    }

    const {
      axisSpec: { tickSize, tickPadding, position, gridLineStyle },
      axisTicksDimensions: { maxLabelBboxHeight },
      chartDimensions,
      chartTheme: { chart: { paddings } },
    } = this.props;

    const config = gridLineStyle ? mergeWithDefaultGridLineConfig(gridLineStyle) : DEFAULT_GRID_LINE_CONFIG;

    const lineProps = isVertical(position) ?
      getVerticalAxisGridLineProps(
        position,
        tickPadding,
        tickSize,
        tick.position,
        chartDimensions.width,
        paddings,
      ) : getHorizontalAxisGridLineProps(
        position,
        tickPadding,
        tickSize,
        tick.position,
        maxLabelBboxHeight,
        chartDimensions.height,
        paddings,
      );

    return <Line key={`tick-${i}`} points={lineProps} {...config} />;
  }

  private renderGrid = () => {
    const { ticks, axisPosition } = this.props;
    return (
      <Group x={axisPosition.left} y={axisPosition.top}>
        <Group key="grid-lines">{ticks.map(this.renderGridLine)}</Group>
      </Group>
    );
  }
}
