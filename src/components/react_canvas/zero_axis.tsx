import React from 'react';
import { Line, Group } from 'react-konva';
import { Dimensions } from '../../utils/dimensions';
import { Theme } from '../../utils/themes/theme';

interface ZeroAxisProps {
  theme: Theme;
  chartDimensions: Dimensions;
  points: number[];
}

export class ZeroAxis extends React.Component<ZeroAxisProps> {
  render() {
    const {
      points,
      chartDimensions,
      theme: {
        zeroAxes: { lineStyle },
      },
    } = this.props;

    return (
      <Group x={chartDimensions.left} y={chartDimensions.top}>
        <Line {...lineStyle} points={points} />
      </Group>
    );
  }
}
