/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import ResizeObserver from 'resize-observer-polyfill';

import { updateParentDimensions } from '../state/actions/chart_settings';
import { GlobalChartState } from '../state/chart_state';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import { isFiniteNumber } from '../utils/common';
import { debounce, DebouncedFunction } from '../utils/debounce';
import { Dimensions } from '../utils/dimensions';

interface ResizerStateProps {
  resizeDebounce: number;
}

interface ResizerDispatchProps {
  updateParentDimensions(dimension: Dimensions): void;
}

type ResizerProps = ResizerStateProps & ResizerDispatchProps;

const DEFAULT_RESIZE_DEBOUNCE = 0;

class Resizer extends React.Component<ResizerProps> {
  private initialResizeComplete = false;

  private readonly containerRef: RefObject<HTMLDivElement>;

  private ro: ResizeObserver;

  private animationFrameID: number;

  private onResizeDebounced?: DebouncedFunction<
    [entries: ResizeObserverEntry[]],
    (entries: ResizeObserverEntry[]) => void
  >;

  constructor(props: ResizerProps) {
    super(props);
    this.containerRef = React.createRef();
    this.ro = new ResizeObserver(this.handleResize);
    this.animationFrameID = NaN;
  }

  componentDidMount() {
    this.onResizeDebounced = debounce(this.onResize, this.props.resizeDebounce);
    if (this.containerRef.current) {
      this.ro.observe(this.containerRef.current as Element);
    }
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.animationFrameID);
    this.ro.disconnect();
  }

  onResize = (entries: ResizeObserverEntry[]) => {
    if (!Array.isArray(entries)) {
      return;
    }
    if (entries.length === 0 || !entries[0]) {
      return;
    }
    const { width, height } = entries[0].contentRect;
    this.animationFrameID = window.requestAnimationFrame(() => {
      this.props.updateParentDimensions({ width, height, top: 0, left: 0 });
    });
  };

  handleResize = (entries: ResizeObserverEntry[]) => {
    if (this.initialResizeComplete) {
      this.onResizeDebounced?.(entries);
    } else {
      this.initialResizeComplete = true;
      this.onResize(entries);
    }
  };

  render() {
    return <div ref={this.containerRef} className="echChartResizer" />;
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ResizerDispatchProps =>
  bindActionCreators(
    {
      updateParentDimensions,
    },
    dispatch,
  );

const mapStateToProps = (state: GlobalChartState): ResizerStateProps => {
  const { resizeDebounce } = getSettingsSpecSelector(state);
  return {
    resizeDebounce: isFiniteNumber(resizeDebounce) ? resizeDebounce : DEFAULT_RESIZE_DEBOUNCE,
  };
};

/** @internal */
export const ChartResizer = connect(mapStateToProps, mapDispatchToProps)(Resizer);
