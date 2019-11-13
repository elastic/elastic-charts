import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { onCursorPositionChange } from '../state/actions/cursor';
import { GlobalChartState, BackwardRef } from '../state/chart_state';
import { onMouseUp, onMouseDown } from '../state/actions/mouse';
import { getInternalChartRendererSelector } from '../state/selectors/get_chart_type_components';
import { isInternalChartEmptySelector } from '../state/selectors/is_chart_empty';
import { isInitialized } from '../state/selectors/is_initialized';
interface ReactiveChartStateProps {
  initialized: boolean;
  isChartEmpty?: boolean;
  chartCursor: string;
  internalChartRenderer: (containerRef: BackwardRef) => JSX.Element | null;
}
interface ReactiveChartDispatchProps {
  onCursorPositionChange: typeof onCursorPositionChange;
  onMouseUp: typeof onMouseUp;
  onMouseDown: typeof onMouseDown;
}

interface ReactiveChartOwnProps {
  getChartContainerRef: BackwardRef;
}

type ReactiveChartProps = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

class ChartContainerComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'ChartContainer';

  shouldComponentUpdate(props: ReactiveChartProps) {
    return props.initialized;
  }

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
        {internalChartRenderer(this.props.getChartContainerRef)}
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
  if (!isInitialized(state)) {
    return {
      initialized: false,
      isChartEmpty: true,
      chartCursor: 'pointer',
      internalChartRenderer: () => null,
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
