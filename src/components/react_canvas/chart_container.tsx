import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { onCursorPositionChange } from '../../store/actions/cursor';
import { ReactiveChart } from './reactive_chart';
import { isChartEmptySelector } from '../../chart_types/xy_chart/store/selectors/is_chart_empty';
import { IChartState } from 'store/chart_store';
import { ChartTypeComponents } from 'components/chart_type_components';
import { ChartResizer } from 'components/chart_resizer';
import { isBrushingSelector } from 'chart_types/xy_chart/store/selectors/is_brushing';
import { isLegendInitializedSelector } from 'chart_types/xy_chart/store/selectors/is_legend_initialized';
interface ReactiveChartProps {
  legendInitialized: boolean;
  isBrushing: boolean;
  isChartEmpty: boolean;
  onCursorPositionChange: typeof onCursorPositionChange;
  chartCursor: string;
}

class ChartContainerComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'ChartContainer';

  render() {
    const { legendInitialized } = this.props;
    if (!legendInitialized) {
      return null;
    }
    const { onCursorPositionChange, isChartEmpty, isBrushing, chartCursor } = this.props;
    return (
      <div
        className="echChartCursorContainer"
        style={{
          cursor: chartCursor,
        }}
        onMouseMove={({ nativeEvent: { offsetX, offsetY } }) => {
          if (!isChartEmpty) {
            onCursorPositionChange(offsetX, offsetY);
          }
        }}
        onMouseLeave={() => {
          onCursorPositionChange(-1, -1);
        }}
        onMouseUp={() => {
          if (isBrushing) {
            return;
          }
          // handleChartClick();
        }}
      >
        <ChartTypeComponents zIndex={-1} type={'dom'} />
        <ChartResizer />
        <ReactiveChart>
          {/* <Provider store={this.chartStore}>
            <ChartTypeComponents zIndex={-1} type={'canvas'} />
          </Provider>
          <Provider store={this.chartStore}>
            <ChartTypeComponents zIndex={1} type={'canvas'} />
          </Provider> */}
        </ReactiveChart>
        <ChartTypeComponents zIndex={1} type={'dom'} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      onCursorPositionChange,
      // handleChartClick,
    },
    dispatch,
  );
const mapStateToProps = (state: IChartState) => {
  if (!state.initialized) {
    console.log('not initialized');
    return {
      initialized: false,
      legendInitialized: false,
      isChartEmpty: true,
      isBrushing: false,
      chartCursor: 'pointer',
    };
  }
  const legendInitialized = isLegendInitializedSelector(state);
  if (!legendInitialized) {
    console.log('not legendInitialized');
    return {
      initialized: false,
      legendInitialized: false,
      isChartEmpty: true,
      isBrushing: false,
      chartCursor: 'pointer',
    };
  }
  console.log('initialized');
  return {
    initialized: state.initialized,
    legendInitialized: isLegendInitializedSelector(state),
    isChartEmpty: isChartEmptySelector(state),
    isBrushing: isBrushingSelector(state),
    chartCursor: 'pointer', //todo
  };
};

export const ChartContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChartContainerComponent);
