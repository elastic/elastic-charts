/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { CSSProperties } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { DEFAULT_CSS_CURSOR } from '../common/constants';
import { SettingsSpec, TooltipSpec } from '../specs';
import { onKeyPress as onKeyPressAction } from '../state/actions/key';
import {
  onMouseUp as onMouseUpAction,
  onMouseDown as onMouseDownAction,
  onPointerMove as onPointerMoveAction,
} from '../state/actions/mouse';
import {
  onTooltipPinned as onTooltipPinnedAction,
  onTooltipItemSelected as onTooltipItemSelectedAction,
} from '../state/actions/tooltip';
import { GlobalChartState, BackwardRef, TooltipInteractionState } from '../state/chart_state';
import { getInternalChartRendererSelector } from '../state/selectors/get_chart_type_components';
import { getInternalPointerCursor } from '../state/selectors/get_internal_cursor_pointer';
import { getInternalIsBrushingSelector } from '../state/selectors/get_internal_is_brushing';
import { getInternalIsBrushingAvailableSelector } from '../state/selectors/get_internal_is_brushing_available';
import { getInternalIsInitializedSelector, InitStatus } from '../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../state/selectors/get_tooltip_spec';
import { isInternalChartEmptySelector } from '../state/selectors/is_chart_empty';
import { deepEqual } from '../utils/fast_deep_equal';
import { NoResults } from './no_results';

interface ChartContainerComponentStateProps {
  status: InitStatus;
  isChartEmpty?: boolean;
  pointerCursor: CSSProperties['cursor'];
  isBrushing: boolean;
  tooltipState: TooltipInteractionState;
  initialized?: boolean;
  isBrushingAvailable: boolean;
  settings?: SettingsSpec;
  tooltip: TooltipSpec;
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
  onTooltipPinned: typeof onTooltipPinnedAction;
  onTooltipItemSelected: typeof onTooltipItemSelectedAction;
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
  static watchedKeys: KeyboardEvent['key'][] = ['Escape'];

  shouldComponentUpdate(nextProps: ReactiveChartProps) {
    return !deepEqual(this.props, nextProps);
  }

  handleMouseMove = ({
    nativeEvent: { offsetX, offsetY, timeStamp },
  }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onPointerMove, internalChartRenderer } = this.props;
    if (isChartEmpty || internalChartRenderer.name === 'FlameWithTooltip') {
      // Flame chart does its own event handling, and panning temporarily attaches
      // an event handler onto `window`. So this `chart_container.handleMouseMove`
      // can not be avoided with `e.stopPropagation()`. So we should avoid emission
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
    nativeEvent: { offsetX, offsetY, timeStamp, button },
  }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onMouseDown, isBrushingAvailable, tooltipState } = this.props;

    // button 2 to block brushing on right click
    if (tooltipState.pinned || button === 2 || isChartEmpty) return;

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

  handleContextClose = () => {
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('click', this.handleContextClose);
    window.removeEventListener('scroll', this.handleContextClose);
    this.props.onTooltipPinned(false);
  };

  handleMouseRightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, tooltipState } = this.props;
    if (isChartEmpty) {
      return;
    }

    e.preventDefault(); // prevent browser context menu

    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('click', this.handleContextClose);
    window.addEventListener('scroll', this.handleContextClose);

    this.props.onTooltipPinned(!tooltipState.pinned);
  };

  handleMouseUp = ({ nativeEvent: { offsetX, offsetY, timeStamp } }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, onMouseUp, tooltipState } = this.props;
    if (tooltipState.pinned || isChartEmpty) {
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
    if (!ChartContainerComponent.watchedKeys.includes(key)) return;

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
    onMouseUp({ x: -1, y: -1 }, Date.now());
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
    const pinnableTooltip = this.props.tooltip.actions.length > 0;

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
        onContextMenu={pinnableTooltip ? this.handleMouseRightClick : undefined}
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
      onTooltipPinned: onTooltipPinnedAction,
      onTooltipItemSelected: onTooltipItemSelectedAction,
    },
    dispatch,
  );
const mapStateToProps = (state: GlobalChartState): ChartContainerComponentStateProps => {
  const status = getInternalIsInitializedSelector(state);
  const settings = getSettingsSpecSelector(state);
  const tooltip = getTooltipSpecSelector(state);
  const initialized = !state.specParsing && state.specsInitialized;
  const tooltipState = state.interactions.tooltip;

  if (status !== InitStatus.Initialized) {
    return {
      status,
      initialized,
      tooltipState,
      pointerCursor: DEFAULT_CSS_CURSOR,
      isBrushingAvailable: false,
      isBrushing: false,
      internalChartRenderer: () => null,
      settings,
      tooltip,
    };
  }

  return {
    status,
    initialized,
    tooltipState,
    isChartEmpty: isInternalChartEmptySelector(state),
    pointerCursor: getInternalPointerCursor(state),
    isBrushingAvailable: getInternalIsBrushingAvailableSelector(state),
    isBrushing: getInternalIsBrushingSelector(state),
    internalChartRenderer: getInternalChartRendererSelector(state),
    settings,
    tooltip,
  };
};

/** @internal */
export const ChartContainer = connect(mapStateToProps, mapDispatchToProps)(ChartContainerComponent);
