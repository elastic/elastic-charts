import React from 'react';
import { AxisLinePosition, mergeWithDefaultGridLineConfig } from '../../lib/axes/axis_utils';
import { DEFAULT_GRID_LINE_CONFIG, GridLineConfig } from '../../lib/themes/theme';
import { Dimensions } from '../../lib/utils/dimensions';

interface GridProps {
  chartDimensions: Dimensions;
  debug: boolean;
  gridLineStyle: GridLineConfig | undefined;
  linesPositions: AxisLinePosition[];
}

export class Grid extends React.PureComponent<GridProps> {
  render() {
    return this.renderGrid();
  }
  private renderGridLine = (linePosition: AxisLinePosition, i: number) => {
    const { gridLineStyle } = this.props;

    const config = gridLineStyle
      ? mergeWithDefaultGridLineConfig(gridLineStyle)
      : DEFAULT_GRID_LINE_CONFIG;

    return (
      <line
        key={`tick-${i}`}
        x1={linePosition[0]}
        y1={linePosition[1]}
        x2={linePosition[2]}
        y2={linePosition[3]}
        {...config}
      />
    );
  }

  private renderGrid = () => {
    const { chartDimensions, linesPositions } = this.props;

    return (
      <g x={chartDimensions.left} y={chartDimensions.top}>
        <g key="grid-lines">{linesPositions.map(this.renderGridLine)}</g>
      </g>
    );
  }
}
