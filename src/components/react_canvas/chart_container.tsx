import React from 'react';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { ChartStore } from '../../chart_types/xy_chart/store/chart_state';
import { ReactiveChart } from './reactive_chart';
interface ReactiveChartProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
}

class ChartContainerComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'ChartContainer';

  render() {
    const { initialized } = this.props.chartStore!;
    if (!initialized.get()) {
      return null;
    }
    const className = classNames('echChartCursorContainer', {
      'echChart--isBrushEnabled': this.props.chartStore!.isCrosshairCursorVisible.get(),
    });
    const { setCursorPosition } = this.props.chartStore!;

    return (
      <div
        className={className}
        onMouseMove={({ nativeEvent: { offsetX, offsetY } }) => {
          setCursorPosition(offsetX, offsetY);
        }}
        onMouseLeave={() => {
          setCursorPosition(-1, -1);
        }}
        onMouseUp={() => {
          if (this.props.chartStore!.isBrushing.get()) {
            return;
          }
          this.props.chartStore!.handleChartClick();
        }}
      >
        <ReactiveChart />
      </div>
    );
  }
}

export const ChartContainer = inject('chartStore')(observer(ChartContainerComponent));
