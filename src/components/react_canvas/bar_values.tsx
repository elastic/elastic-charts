import React from 'react';
import { Group, Text } from 'react-konva';
import { BarGeometry } from '../../lib/series/rendering';
import { DisplayValueStyle } from '../../lib/themes/theme';
import { Dimensions } from '../../lib/utils/dimensions';
import { buildBarValueProps } from './utils/rendering_props_utils';

interface BarValuesProps {
  chartDimensions: Dimensions;
  debug: boolean;
  bars: BarGeometry[];
  displayValueStyle: DisplayValueStyle;
}

export class BarValues extends React.PureComponent<BarValuesProps> {
  render() {
    const { chartDimensions } = this.props;

    return (
      <Group x={chartDimensions.left} y={chartDimensions.top}>
        {this.renderBarValues()}
      </Group>
    );
  }

  private renderBarValues = () => {
    const { bars, displayValueStyle } = this.props;
    return bars.map((bar, index) => {
      const { displayValue, x, y, width, height } = bar;
      const key = `bar-value-${index}`;
      const displayValueProps = buildBarValueProps({
        x,
        y,
        width,
        height,
        displayValueStyle,
      });

      return displayValue && <Text text={displayValue} {...displayValueProps} key={key} />;
    });
  }
}
