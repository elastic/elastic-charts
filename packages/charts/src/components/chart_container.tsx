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

import { NoResults } from './no_results';
import { ChartType } from '../chart_types';
import { DEFAULT_CSS_CURSOR, SECONDARY_BUTTON } from '../common/constants';
import { SettingsSpec, TooltipSpec } from '../specs';
import { onKeyPress as onKeyPressAction } from '../state/actions/key';
import {
  onMouseUp as onMouseUpAction,
  onMouseDown as onMouseDownAction,
  onPointerMove as onPointerMoveAction,
} from '../state/actions/mouse';
import { pinTooltip as pinTooltipAction } from '../state/actions/tooltip';
import { GlobalChartState } from '../state/chart_state';
import { TooltipInteractionState } from '../state/interactions_state';
import { BackwardRef } from '../state/internal_chart_state';
import { isPinnableTooltip } from '../state/selectors/can_pin_tooltip';
import { getInternalChartRendererSelector } from '../state/selectors/get_chart_type_components';
import { getInternalPointerCursor } from '../state/selectors/get_internal_cursor_pointer';
import { getInternalIsBrushingSelector } from '../state/selectors/get_internal_is_brushing';
import { getInternalIsBrushingAvailableSelector } from '../state/selectors/get_internal_is_brushing_available';
import { getInternalIsInitializedSelector, InitStatus } from '../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import { getTooltipSpecSelector } from '../state/selectors/get_tooltip_spec';
import { isInternalChartEmptySelector } from '../state/selectors/is_chart_empty';
import { deepEqual } from '../utils/fast_deep_equal';

interface ChartContainerComponentStateProps {
  status: InitStatus;
  isChartEmpty?: boolean;
  pointerCursor: CSSProperties['cursor'];
  isBrushing: boolean;
  tooltipState: TooltipInteractionState;
  initialized?: boolean;
  canPinTooltip: boolean;
  isBrushingAvailable: boolean;
  settings?: SettingsSpec;
  tooltip: TooltipSpec;
  disableInteractions: boolean;
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
  pinTooltip: typeof pinTooltipAction;
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
    const { isChartEmpty, disableInteractions, onPointerMove, internalChartRenderer } = this.props;
    if (isChartEmpty || disableInteractions || internalChartRenderer.name === 'FlameWithTooltip') {
      // Flame chart does its own event handling, and panning temporarily attaches
      // an event handler onto `window`. So this `chart_container.handleMouseMove`
      // can not be avoided with `e.stopPropagation()`. So we should avoid emission
      return;
    }

    onPointerMove({
      position: {
        x: offsetX,
        y: offsetY,
      },
      time: timeStamp,
    });
  };

  handleMouseLeave = ({ nativeEvent: { timeStamp } }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, disableInteractions, onPointerMove, isBrushing } = this.props;
    if (isChartEmpty || disableInteractions || isBrushing) {
      return;
    }
    onPointerMove({ position: { x: -1, y: -1 }, time: timeStamp });
  };

  handleMouseDown = ({
    nativeEvent: { offsetX, offsetY, timeStamp, button, ctrlKey },
  }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, disableInteractions, onMouseDown, isBrushingAvailable, tooltipState } = this.props;

    // button 2 to block brushing on right click
    if (tooltipState.pinned || button === SECONDARY_BUTTON || ctrlKey || isChartEmpty || disableInteractions) return;

    if (isBrushingAvailable) {
      window.addEventListener('mouseup', this.handleBrushEnd);
    }

    window.addEventListener('keyup', this.handleKeyUp);

    onMouseDown({
      position: {
        x: offsetX,
        y: offsetY,
      },
      time: timeStamp,
    });
  };

  handleUnpinningTooltip = () => {
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('click', this.handleUnpinningTooltip);
    window.removeEventListener('scroll', this.handleUnpinningTooltip);
    window.removeEventListener('visibilitychange', this.handleUnpinningTooltip);
    this.props.pinTooltip({ pinned: false, resetPointer: true });
  };

  handleContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, disableInteractions, tooltipState } = this.props;
    if (isChartEmpty || disableInteractions) {
      return;
    }

    e.preventDefault(); // prevent browser context menu

    if (tooltipState.pinned) {
      this.handleUnpinningTooltip();
      return;
    }

    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('click', this.handleUnpinningTooltip);
    window.addEventListener('scroll', this.handleUnpinningTooltip);
    window.addEventListener('visibilitychange', this.handleUnpinningTooltip);

    this.props.pinTooltip({ pinned: true });
  };

  handleMouseUp = ({ nativeEvent: { offsetX, offsetY, timeStamp } }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { isChartEmpty, disableInteractions, onMouseUp, tooltipState } = this.props;
    if (tooltipState.pinned || isChartEmpty || disableInteractions) {
      return;
    }

    window.removeEventListener('keyup', this.handleKeyUp);

    onMouseUp({
      position: {
        x: offsetX,
        y: offsetY,
      },
      time: timeStamp,
    });
  };

  handleKeyUp = ({ key }: KeyboardEvent) => {
    if (!ChartContainerComponent.watchedKeys.includes(key)) return;

    window.removeEventListener('keyup', this.handleKeyUp);

    const { isChartEmpty, disableInteractions, onKeyPress } = this.props;
    if (isChartEmpty || disableInteractions) {
      return;
    }

    onKeyPress(key);
  };

  handleBrushEnd = () => {
    const { onMouseUp } = this.props;

    window.removeEventListener('mouseup', this.handleBrushEnd);
    onMouseUp({ position: { x: -1, y: -1 }, time: Date.now() });
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
        onContextMenu={this.props.canPinTooltip ? this.handleContextMenu : undefined}
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
      pinTooltip: pinTooltipAction,
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
      canPinTooltip: false,
      pointerCursor: DEFAULT_CSS_CURSOR,
      isBrushingAvailable: false,
      isBrushing: false,
      internalChartRenderer: () => null,
      settings,
      tooltip,
      disableInteractions: false,
    };
  }

  return {
    status,
    initialized,
    tooltipState,
    isChartEmpty: isInternalChartEmptySelector(state),
    canPinTooltip: isPinnableTooltip(state),
    pointerCursor: getInternalPointerCursor(state),
    isBrushingAvailable: getInternalIsBrushingAvailableSelector(state),
    isBrushing: getInternalIsBrushingSelector(state),
    internalChartRenderer: getInternalChartRendererSelector(state),
    settings,
    tooltip,
    disableInteractions: state.chartType === ChartType.Flame,
  };
};

/** @internal */
export const ChartContainer = connect(mapStateToProps, mapDispatchToProps)(ChartContainerComponent);
