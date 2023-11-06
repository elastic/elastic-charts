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

import { DEFAULT_RESIZE_DEBOUNCE } from '../specs/constants';
import { ResizeListener } from '../specs/settings';
import { updateParentDimensions } from '../state/actions/chart_settings';
import { GlobalChartState } from '../state/chart_state';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';
import { isFiniteNumber } from '../utils/common';
import { debounce, DebouncedFunction } from '../utils/debounce';

interface ResizerStateProps {
  resizeDebounce: number;
  onResize?: ResizeListener;
}

interface ResizerDispatchProps {
  updateParentDimensions: typeof updateParentDimensions;
}

type ResizerProps = ResizerStateProps & ResizerDispatchProps;
type ResizeFn = (entries: ResizeObserverEntry[]) => void;

class Resizer extends React.Component<ResizerProps> {
  private initialResizeComplete = false;

  private readonly containerRef: RefObject<HTMLDivElement>;

  private ro: ResizeObserver;

  private animationFrameID: number;

  private onResizeDebounced?: ResizeFn | DebouncedFunction<Parameters<ResizeFn>, ResizeFn>;

  constructor(props: ResizerProps) {
    super(props);
    this.containerRef = React.createRef();
    this.ro = new ResizeObserver(this.handleResize);
    this.animationFrameID = NaN;
  }

  componentDidMount() {
    this.setupResizeDebounce();
    if (this.containerRef.current) {
      this.ro.observe(this.containerRef.current as Element);
    }
  }

  componentDidUpdate({ resizeDebounce }: Readonly<ResizerProps>): void {
    if (resizeDebounce !== this.props.resizeDebounce) this.setupResizeDebounce();
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.animationFrameID);
    this.ro.disconnect();
  }

  setupResizeDebounce() {
    this.onResizeDebounced =
      this.props.resizeDebounce > 0 ? debounce(this.onResize, this.props.resizeDebounce) : this.onResize;
  }

  onResize: ResizeFn = (entries) => {
    if (!Array.isArray(entries)) {
      return;
    }
    if (entries.length === 0 || !entries[0]) {
      return;
    }
    const { width, height } = entries[0].contentRect;
    this.animationFrameID = window.requestAnimationFrame(() => {
      this.props.updateParentDimensions({ width, height, top: 0, left: 0 });
      this.props.onResize?.();
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
  const { resizeDebounce, onResize } = getSettingsSpecSelector(state);
  return {
    resizeDebounce: isFiniteNumber(resizeDebounce) ? resizeDebounce : DEFAULT_RESIZE_DEBOUNCE,
    onResize,
  };
};

/** @internal */
export const ChartResizer = connect(mapStateToProps, mapDispatchToProps)(Resizer);
