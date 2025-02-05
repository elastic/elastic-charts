/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, { CSSProperties, ReactNode, createRef } from 'react';
import { Provider } from 'react-redux';
import { Unsubscribe } from 'redux';
import { OptionalKeys } from 'utility-types';
import { v4 as uuidv4 } from 'uuid';

import { ChartBackground } from './chart_background';
import { ChartContainer } from './chart_container';
import { ChartResizer } from './chart_resizer';
import { ChartStatus } from './chart_status';
import { Legend } from './legend/legend';
import { getElementZIndex } from './portal/utils';
import { Colors } from '../common/colors';
import { LegendPositionConfig, PointerEvent } from '../specs';
import { SpecsParser } from '../specs/specs_parser';
import { updateParentDimensions, updateChartTitles } from '../state/actions/chart_settings';
import { onExternalPointerEvent } from '../state/actions/events';
import { onComputedZIndex } from '../state/actions/z_index';
import { chartStore, initialize } from '../state/chart_state';
import { getChartContainerUpdateStateSelector } from '../state/selectors/chart_container_updates';
import { getInternalIsInitializedSelector, InitStatus } from '../state/selectors/get_internal_is_intialized';
import { ChartSize, getChartSize, getFixedChartSize } from '../utils/chart_size';
import { LayoutDirection } from '../utils/common';
import { deepEqual } from '../utils/fast_deep_equal';
import { LIGHT_THEME } from '../utils/themes/light_theme';

/** @public */
export interface ChartProps {
  /**
   * The type of rendered
   * @defaultValue `canvas`
   */
  renderer?: 'svg' | 'canvas';
  size?: ChartSize;
  className?: string;
  id?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
}

interface ChartState {
  legendDirection: LegendPositionConfig['direction'];
  paddingLeft: number;
  paddingRight: number;
  displayTitles: boolean;
}

/** @public */
export class Chart extends React.Component<ChartProps, ChartState> {
  static defaultProps: Pick<ChartProps, OptionalKeys<ChartProps>> = {
    renderer: 'canvas',
  };

  private unsubscribeToStore: Unsubscribe;

  private chartContainerRef: React.RefObject<HTMLDivElement>;

  private chartStageRef: React.RefObject<HTMLCanvasElement>;

  constructor(props: ChartProps) {
    super(props);
    this.chartContainerRef = createRef();
    this.chartStageRef = createRef();

    this.state = {
      legendDirection: LayoutDirection.Vertical,
      paddingLeft: LIGHT_THEME.chartMargins.left,
      paddingRight: LIGHT_THEME.chartMargins.right,
      displayTitles: true,
    };
    this.unsubscribeToStore = chartStore.subscribe(() => {
      const state = chartStore.getState();
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
        return;
      }

      const newState = getChartContainerUpdateStateSelector(state);
      if (!deepEqual(this.state, newState)) this.setState(newState);

      if (state.internalChartState) {
        state.internalChartState.eventCallbacks(state);
      }
    });
  }

  componentDidMount() {
    if (this.chartContainerRef.current) {
      const id = this.props.id ?? uuidv4();
      chartStore.dispatch(initialize({ id, title: this.props.title, description: this.props.description }));

      const zIndex = getElementZIndex(this.chartContainerRef.current, document.body);
      chartStore.dispatch(onComputedZIndex(zIndex));
    }
  }

  componentWillUnmount() {
    this.unsubscribeToStore();
  }

  componentDidUpdate({ title, description, size }: Readonly<ChartProps>) {
    if (title !== this.props.title || description !== this.props.description) {
      chartStore.dispatch(updateChartTitles({ title: this.props.title, description: this.props.description }));
    }
    const prevChartSize = getChartSize(size);
    const newChartSize = getFixedChartSize(this.props.size);
    // if the size is specified in pixels then update directly the store
    if (newChartSize && (newChartSize.width !== prevChartSize.width || newChartSize.height !== prevChartSize.height)) {
      chartStore.dispatch(updateParentDimensions({ ...newChartSize, top: 0, left: 0 }));
    }
  }

  getPNGSnapshot(
    // eslint-disable-next-line unicorn/no-object-as-default-parameter
    options = {
      backgroundColor: Colors.Transparent.keyword,
    },
  ): {
    blobOrDataUrl: any;
    browser: 'IE11' | 'other';
  } | null {
    if (!this.chartStageRef.current) {
      return null;
    }
    const canvas = this.chartStageRef.current;
    const backgroundCanvas = document.createElement('canvas');
    backgroundCanvas.width = canvas.width;
    backgroundCanvas.height = canvas.height;
    const bgCtx = backgroundCanvas.getContext('2d');
    if (!bgCtx) {
      return null;
    }
    bgCtx.fillStyle = options.backgroundColor;
    bgCtx.fillRect(0, 0, canvas.width, canvas.height);
    bgCtx.drawImage(canvas, 0, 0);

    return {
      blobOrDataUrl: backgroundCanvas.toDataURL(),
      browser: 'other',
    };
  }

  getChartContainerRef = () => this.chartContainerRef;

  dispatchExternalPointerEvent(event: PointerEvent) {
    chartStore.dispatch(onExternalPointerEvent(event));
  }

  render() {
    const { size, className } = this.props;
    const containerSizeStyle = getChartSize(size);
    const chartContentClassNames = classNames('echChartContent', className, {
      'echChartContent--column': this.state.legendDirection === LayoutDirection.Horizontal,
    });

    return (
      <Provider store={chartStore}>
        <div className="echChart" style={containerSizeStyle}>
          <Titles
            displayTitles={this.state.displayTitles}
            title={this.props.title}
            description={this.props.description}
            paddingLeft={this.state.paddingLeft}
            paddingRight={this.state.paddingRight}
          />
          <div className={chartContentClassNames}>
            <ChartBackground />
            <ChartStatus />
            <ChartResizer />
            <Legend />
            <SpecsParser>{this.props.children}</SpecsParser>
            <div className="echContainer" ref={this.chartContainerRef}>
              <ChartContainer getChartContainerRef={this.getChartContainerRef} forwardStageRef={this.chartStageRef} />
            </div>
          </div>
        </div>
      </Provider>
    );
  }
}

function Titles({
  displayTitles,
  title,
  description,
  paddingLeft,
  paddingRight,
}: Pick<ChartProps, 'title' | 'description'> & Pick<ChartState, 'displayTitles' | 'paddingLeft' | 'paddingRight'>) {
  if (!displayTitles || (!title && !description)) return null;

  const titleDescStyle: CSSProperties = {
    paddingLeft,
    paddingRight,
  };

  return (
    <div className="echChart__titles">
      {title && (
        <h3 className="echChartTitle" style={titleDescStyle}>
          {title}
        </h3>
      )}
      {description && (
        <h4 className="echChartDescription" style={titleDescStyle}>
          {description}
        </h4>
      )}
    </div>
  );
}
