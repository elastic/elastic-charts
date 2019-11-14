import React from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { onCursorPositionChange } from '../state/actions/cursor';
import { GlobalChartState, BackwardRef } from '../state/chart_state';
import { onMouseUp, onMouseDown } from '../state/actions/mouse';
import { getInternalChartRendererSelector } from '../state/selectors/get_chart_type_components';
import { getInternalCursorPointer } from '../state/selectors/get_internal_cursor_pointer';
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
  onMouseMove = ({ nativeEvent: { offsetX, offsetY } }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onCursorPositionChange } = this.props;
    if (isChartEmpty) {
      return;
    }
    onCursorPositionChange(offsetX, offsetY);
  };
  onMouseLeave = () => {
    const { isChartEmpty, onCursorPositionChange } = this.props;
    if (isChartEmpty) {
      return;
    }
    onCursorPositionChange(-1, -1);
  };
  onMouseDown = ({ nativeEvent: { offsetX, offsetY } }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onMouseDown } = this.props;
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
  };
  onMouseUp = ({ nativeEvent: { offsetX, offsetY } }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onMouseUp } = this.props;
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
  };

  render() {
    const { initialized } = this.props;
    if (!initialized) {
      return null;
    }
    const { chartCursor, internalChartRenderer } = this.props;
    return (
      <div
        className="echChartCursorContainer"
        style={{
          cursor: chartCursor,
        }}
        onMouseMove={this.onMouseMove}
        onMouseLeave={this.onMouseLeave}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
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
      chartCursor: 'default',
      internalChartRenderer: () => null,
    };
  }

  return {
    initialized: true,
    isChartEmpty: isInternalChartEmptySelector(state),
    chartCursor: getInternalCursorPointer(state),
    internalChartRenderer: getInternalChartRendererSelector(state),
  };
};

export const ChartContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChartContainerComponent);
