import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Rotation } from '../../utils/specs';
import { Theme } from 'utils/themes/theme';
import { Dimensions } from 'utils/dimensions';
import { BarGeometry } from 'utils/geometry';
import { buildBarValueProps } from './bar_values_utils';
import { connect } from 'react-redux';
import { IChartState } from 'store/chart_store';
import { getChartThemeSelector } from 'store/selectors/get_chart_theme';
import { computeChartDimensionsSelector } from 'chart_types/xy_chart/store/selectors/compute_chart_dimensions';
import { getChartRotationSelector } from 'store/selectors/get_chart_rotation';
import { computeSeriesGeometriesSelector } from 'chart_types/xy_chart/store/selectors/compute_series_geometries';

interface BarValuesProps {
  theme: Theme;
  chartDimensions: Dimensions;
  chartRotation: Rotation;
  debug: boolean;
  bars: BarGeometry[];
}

export class BarValuesComponent extends React.PureComponent<BarValuesProps> {
  render() {
    const { chartDimensions, bars } = this.props;
    if (!bars) {
      return;
    }

    return (
      <Group x={chartDimensions.left} y={chartDimensions.top}>
        {this.renderBarValues()}
      </Group>
    );
  }

  private renderBarValues = () => {
    const { bars, debug, chartRotation, chartDimensions, theme } = this.props;
    const displayValueStyle = theme.barSeriesStyle.displayValue;

    return bars.map((bar, index) => {
      const { displayValue, x, y, height, width } = bar;
      if (!displayValue) {
        return;
      }

      const key = `bar-value-${index}`;
      const displayValueProps = buildBarValueProps({
        x,
        y,
        barHeight: height,
        barWidth: width,
        displayValueStyle,
        displayValue,
        chartRotation,
        chartDimensions,
      });

      const debugProps = {
        ...displayValueProps,
        stroke: 'violet',
        strokeWidth: 1,
        fill: 'transparent',
      };

      return (
        <Group key={key}>
          {debug && <Rect {...debugProps} />}
          {displayValue && <Text {...displayValueProps} />}
        </Group>
      );
    });
  };
}

const mapDispatchToProps = () => ({});
const mapStateToProps = (state: IChartState): BarValuesProps => {
  const geometries = computeSeriesGeometriesSelector(state);
  return {
    theme: getChartThemeSelector(state),
    chartDimensions: computeChartDimensionsSelector(state).chartDimensions,
    chartRotation: getChartRotationSelector(state),
    debug: state.settings.debug,
    bars: geometries.geometries.bars,
  };
};

export const BarValues = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BarValuesComponent);
