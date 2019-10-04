import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { onCursorPositionChange } from '../../store/actions/cursor';
import { ReactiveChart } from './reactive_chart';
import { isChartEmptySelector } from '../../chart_types/xy_chart/store/selectors/is_chart_empty';
import { IChartState, GetCustomChartComponent } from '../../store/chart_store';
import { ChartResizer } from '../chart_resizer';
import { isLegendInitializedSelector } from '../../chart_types/xy_chart/store/selectors/is_legend_initialized';
import { onMouseUp, onMouseDown } from '../../store/actions/mouse';
import { getChartTypeComponentSelector } from 'store/selectors/get_chart_type_components';
interface ReactiveChartProps {
  legendInitialized: boolean;
  isChartEmpty: boolean;
  onCursorPositionChange: typeof onCursorPositionChange;
  onMouseUp: typeof onMouseUp;
  onMouseDown: typeof onMouseDown;
  chartCursor: string;
  getCustomChartComponents?: GetCustomChartComponent;
}

class ChartContainerComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'ChartContainer';

  render() {
    const { legendInitialized } = this.props;
    if (!legendInitialized) {
      return null;
    }
    const {
      onCursorPositionChange,
      isChartEmpty,
      chartCursor,
      onMouseUp,
      onMouseDown,
      getCustomChartComponents,
    } = this.props;
    return (
      <div
        className="echChartCursorContainer"
        style={{
          cursor: chartCursor,
        }}
        onMouseMove={({ nativeEvent: { offsetX, offsetY } }) => {
          if (isChartEmpty) {
            return;
          }
          onCursorPositionChange(offsetX, offsetY);
        }}
        onMouseLeave={() => {
          if (isChartEmpty) {
            return;
          }
          onCursorPositionChange(-1, -1);
        }}
        onMouseDown={({ nativeEvent: { offsetX, offsetY } }) => {
          if (isChartEmpty) {
            return;
          }
          onMouseDown(
            {
              x: offsetX,
              y: offsetY,
            },
            Date.now(),
          );
        }}
        onMouseUp={({ nativeEvent: { offsetX, offsetY } }) => {
          if (isChartEmpty) {
            return;
          }
          onMouseUp(
            {
              x: offsetX,
              y: offsetY,
            },
            Date.now(),
          );
        }}
      >
        <ChartResizer />
        {getCustomChartComponents && getCustomChartComponents('dom', -1)}
        <ReactiveChart />
        {getCustomChartComponents && getCustomChartComponents('dom', 1)}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      onCursorPositionChange,
      onMouseUp,
      onMouseDown,
    },
    dispatch,
  );
const mapStateToProps = (state: IChartState) => {
  if (!state.initialized) {
    // console.log('not initialized');
    return {
      initialized: false,
      legendInitialized: false,
      isChartEmpty: true,
      chartCursor: 'pointer',
    };
  }
  const legendInitialized = isLegendInitializedSelector(state);
  if (!legendInitialized) {
    // console.log('not legendInitialized');
    return {
      initialized: false,
      legendInitialized: false,
      isChartEmpty: true,
      chartCursor: 'pointer',
    };
  }
  // console.log('initialized');
  return {
    initialized: state.initialized,
    legendInitialized: isLegendInitializedSelector(state),
    isChartEmpty: isChartEmptySelector(state),
    chartCursor: 'pointer', //todo
    getCustomChartComponents: getChartTypeComponentSelector(state),
  };
};

export const ChartContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChartContainerComponent);
