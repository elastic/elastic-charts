/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { DEFAULT_CSS_CURSOR } from '../common/constants';
import { SettingsSpec } from '../specs';
import { onKeyPress as onKeyPressAction } from '../state/actions/key';
import {
  onMouseUp as onMouseUpAction,
  onMouseDown as onMouseDownAction,
  onPointerMove as onPointerMoveAction,
} from '../state/actions/mouse';
import { GlobalChartState, BackwardRef } from '../state/chart_state';
import { getInternalChartRendererSelector } from '../state/selectors/get_chart_type_components';
import { getInternalPointerCursor } from '../state/selectors/get_internal_cursor_pointer';
import { getInternalIsBrushingSelector } from '../state/selectors/get_internal_is_brushing';
import { getInternalIsBrushingAvailableSelector } from '../state/selectors/get_internal_is_brushing_available';
import { getInternalIsInitializedSelector, InitStatus } from '../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_specs';
import { isInternalChartEmptySelector } from '../state/selectors/is_chart_empty';
import { deepEqual } from '../utils/fast_deep_equal';
import { NoResults } from './no_results';

interface ChartContainerComponentStateProps {
  status: InitStatus;
  isChartEmpty?: boolean;
  pointerCursor: string;
  isBrushing: boolean;
  initialized?: boolean;
  isBrushingAvailable: boolean;
  settings?: SettingsSpec;
  internalChartRenderer: (
    containerRef: BackwardRef,
    forwardStageRef: React.RefObject<HTMLCanvasElement>,
  ) => JSX.Element | null;
}
interface ChartContainerComponentDispatchProps {
  onPointerMove: typeof onPointerMoveAction;
  onMouseUp: typeof onMouseUpAction;
  onMouseDown: typeof onMouseDownAction;
  onKeyPress: typeof onKeyPressAction;
}

interface ChartContainerComponentOwnProps {
  getChartContainerRef: BackwardRef;
  forwardStageRef: React.RefObject<HTMLCanvasElement>;
}

type ReactiveChartProps = ChartContainerComponentStateProps &
  ChartContainerComponentDispatchProps &
  ChartContainerComponentOwnProps;

class ChartContainerComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'ChartContainer';

  shouldComponentUpdate(nextProps: ReactiveChartProps) {
    return !deepEqual(this.props, nextProps);
  }

  handleMouseMove = ({
    nativeEvent: { offsetX, offsetY, timeStamp },
  }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onPointerMove } = this.props;
    if (isChartEmpty) {
      return;
    }

    onPointerMove(
      {
        x: offsetX,
        y: offsetY,
      },
      timeStamp,
    );
  };

  handleMouseLeave = ({ nativeEvent: { timeStamp } }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onPointerMove, isBrushing } = this.props;
    if (isChartEmpty) {
      return;
    }
    if (isBrushing) {
      return;
    }
    onPointerMove({ x: -1, y: -1 }, timeStamp);
  };

  handleMouseDown = ({
    nativeEvent: { offsetX, offsetY, timeStamp },
  }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onMouseDown, isBrushingAvailable } = this.props;
    if (isChartEmpty) {
      return;
    }

    if (isBrushingAvailable) {
      window.addEventListener('mouseup', this.handleBrushEnd);
    }

    window.addEventListener('keyup', this.handleKeyUp);

    onMouseDown(
      {
        x: offsetX,
        y: offsetY,
      },
      timeStamp,
    );
  };

  handleMouseUp = ({ nativeEvent: { offsetX, offsetY, timeStamp } }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onMouseUp } = this.props;
    if (isChartEmpty) {
      return;
    }

    window.removeEventListener('keyup', this.handleKeyUp);

    onMouseUp(
      {
        x: offsetX,
        y: offsetY,
      },
      timeStamp,
    );
  };

  handleKeyUp = ({ key }: KeyboardEvent) => {
    window.removeEventListener('keyup', this.handleKeyUp);

    const { isChartEmpty, onKeyPress } = this.props;
    if (isChartEmpty) {
      return;
    }

    onKeyPress(key);
  };

  handleBrushEnd = () => {
    const { onMouseUp } = this.props;

    window.removeEventListener('mouseup', this.handleBrushEnd);

    requestAnimationFrame(() => {
      onMouseUp(
        {
          x: -1,
          y: -1,
        },
        Date.now(),
      );
    });
  };

  render() {
    const { status, isChartEmpty, settings, initialized } = this.props;

    if (!initialized || status === InitStatus.ParentSizeInvalid) {
      // TODO: Display error on chart
      return null;
    }

    if (
      status === InitStatus.ChartNotInitialized ||
      status === InitStatus.MissingChartType ||
      status === InitStatus.SpecNotInitialized ||
      isChartEmpty
    ) {
      return <NoResults renderFn={settings?.noResults} />;
    }

    const { pointerCursor, internalChartRenderer, getChartContainerRef, forwardStageRef } = this.props;
    return (
      <div
        className="echChartPointerContainer"
        style={{
          cursor: pointerCursor,
        }}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
      >
        {internalChartRenderer(getChartContainerRef, forwardStageRef)}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ChartContainerComponentDispatchProps =>
  bindActionCreators(
    {
      onPointerMove: onPointerMoveAction,
      onMouseUp: onMouseUpAction,
      onMouseDown: onMouseDownAction,
      onKeyPress: onKeyPressAction,
    },
    dispatch,
  );
const mapStateToProps = (state: GlobalChartState): ChartContainerComponentStateProps => {
  const status = getInternalIsInitializedSelector(state);
  const settings = getSettingsSpecSelector(state);
  const initialized = !state.specParsing && state.specsInitialized;

  if (status !== InitStatus.Initialized) {
    return {
      status,
      initialized,
      pointerCursor: DEFAULT_CSS_CURSOR,
      isBrushingAvailable: false,
      isBrushing: false,
      internalChartRenderer: () => null,
      settings,
    };
  }

  return {
    status,
    initialized,
    isChartEmpty: isInternalChartEmptySelector(state),
    pointerCursor: getInternalPointerCursor(state),
    isBrushingAvailable: getInternalIsBrushingAvailableSelector(state),
    isBrushing: getInternalIsBrushingSelector(state),
    internalChartRenderer: getInternalChartRendererSelector(state),
    settings,
  };
};

/** @internal */
export const ChartContainer = connect(mapStateToProps, mapDispatchToProps)(ChartContainerComponent);
