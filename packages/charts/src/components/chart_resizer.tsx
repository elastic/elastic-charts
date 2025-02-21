/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import type { ResizeListener } from '../specs/settings';
import { updateParentDimensions } from '../state/actions/chart_settings';
import type { GlobalChartState } from '../state/chart_state';
import { getSettingsSpecSelector } from '../state/selectors/get_settings_spec';

interface ResizerStateProps {
  onResize?: ResizeListener;
}

interface ResizerDispatchProps {
  updateParentDimensions: typeof updateParentDimensions;
}

type ResizerProps = ResizerStateProps & ResizerDispatchProps;
type ResizeFn = (entries: ResizeObserverEntry[]) => void;

class Resizer extends React.Component<ResizerProps> {
  private readonly containerRef: RefObject<HTMLDivElement>;

  private ro: ResizeObserver;

  constructor(props: ResizerProps) {
    super(props);
    this.containerRef = React.createRef();
    this.ro = new ResizeObserver(this.onResize);
  }

  componentDidMount() {
    if (this.containerRef.current) {
      this.ro.observe(this.containerRef.current as Element);
    }
  }

  componentWillUnmount() {
    this.ro.disconnect();
  }

  onResize: ResizeFn = (entries) => {
    if (!Array.isArray(entries)) {
      return;
    }
    if (entries.length === 0 || !entries[0]) {
      return;
    }
    const { width, height } = entries[0].contentRect;
    this.props.updateParentDimensions({ width, height, top: 0, left: 0 });
    this.props.onResize?.();
  };

  render() {
    return <div ref={this.containerRef} className="echChartResizer" />;
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ResizerDispatchProps =>
  bindActionCreators({ updateParentDimensions }, dispatch);

const mapStateToProps = (state: GlobalChartState): ResizerStateProps => {
  const { onResize } = getSettingsSpecSelector(state);
  return { onResize };
};

/** @internal */
export const ChartResizer = connect(mapStateToProps, mapDispatchToProps)(Resizer);
