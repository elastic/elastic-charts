import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { onCursorPositionChange } from '../state/actions/cursor';
import { GlobalChartState } from '../state/chart_state';
import { ChartResizer } from './chart_resizer';
import { onMouseUp, onMouseDown } from '../state/actions/mouse';
import { getInternalChartRendererSelector } from '../state/selectors/get_chart_type_components';
import { isInternalChartEmptySelector } from '../state/selectors/is_chart_empty';
interface ReactiveChartProps {
  initialized: boolean;
  isChartEmpty?: boolean;
  chartCursor: string;
  internalChartRenderer: JSX.Element | null;
  onCursorPositionChange: typeof onCursorPositionChange;
  onMouseUp: typeof onMouseUp;
  onMouseDown: typeof onMouseDown;
}

class ChartContainerComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'ChartContainer';

  render() {
    const { initialized } = this.props;
    if (!initialized) {
      return null;
    }
    const {
      onCursorPositionChange,
      isChartEmpty,
      chartCursor,
      onMouseUp,
      onMouseDown,
      internalChartRenderer,
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
        {internalChartRenderer}
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
const mapStateToProps = (state: GlobalChartState) => {
  if (!state.initialized) {
    return {
      initialized: false,
      isChartEmpty: true,
      chartCursor: 'pointer',
      internalChartRenderer: null,
    };
  }
  return {
    initialized: true,
    isChartEmpty: isInternalChartEmptySelector(state),
    chartCursor: 'pointer', //todo
    internalChartRenderer: getInternalChartRendererSelector(state),
  };
};

export const ChartContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChartContainerComponent);
