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
import { createStore, Store, Unsubscribe, StoreEnhancer, applyMiddleware, Middleware } from 'redux';
import { OptionalKeys } from 'utility-types';
import { v4 as uuidv4 } from 'uuid';

import { ChartBackground } from './chart_background';
import { ChartContainer } from './chart_container';
import { ChartResizer } from './chart_resizer';
import { ChartStatus } from './chart_status';
import { ErrorBoundary } from './error_boundary';
import { Legend } from './legend/legend';
import { getElementZIndex } from './portal/utils';
import { Colors } from '../common/colors';
import { LegendPositionConfig, PointerEvent } from '../specs';
import { SpecsParser } from '../specs/specs_parser';
import { updateChartTitles } from '../state/actions/chart_settings';
import { onExternalPointerEvent } from '../state/actions/events';
import { onComputedZIndex } from '../state/actions/z_index';
import { chartStoreReducer, GlobalChartState } from '../state/chart_state';
import { getChartThemeSelector } from '../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../state/selectors/get_internal_is_intialized';
import { getLegendConfigSelector } from '../state/selectors/get_legend_config_selector';
import { ChartSize, getChartSize } from '../utils/chart_size';
import { LayoutDirection } from '../utils/common';
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

const getMiddlware = (id: string): StoreEnhancer => {
  const middlware: Middleware<any, any, any>[] = [];

  // eslint-disable-next-line no-underscore-dangle
  if (typeof window !== 'undefined' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, no-underscore-dangle
    return (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      name: `@elastic/charts (id: ${id})`,
    })(applyMiddleware(...middlware));
  }

  return applyMiddleware(...middlware);
};

/** @public */
export class Chart extends React.Component<ChartProps, ChartState> {
  static defaultProps: Pick<ChartProps, OptionalKeys<ChartProps>> = {
    renderer: 'canvas',
  };

  private unsubscribeToStore: Unsubscribe;

  private chartStore: Store<GlobalChartState>;

  private chartContainerRef: React.RefObject<HTMLDivElement>;

  private chartStageRef: React.RefObject<HTMLCanvasElement>;

  constructor(props: ChartProps) {
    super(props);
    this.chartContainerRef = createRef();
    this.chartStageRef = createRef();

    const id = props.id ?? uuidv4();
    const storeReducer = chartStoreReducer(id, props.title, props.description);
    const enhancer = getMiddlware(id);
    this.chartStore = createStore(storeReducer, enhancer);
    this.state = {
      legendDirection: LayoutDirection.Vertical,
      paddingLeft: LIGHT_THEME.chartMargins.left,
      paddingRight: LIGHT_THEME.chartMargins.right,
      displayTitles: true,
    };
    this.unsubscribeToStore = this.chartStore.subscribe(() => {
      const state = this.chartStore.getState();
      if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
        return;
      }

      const {
        legendPosition: { direction },
      } = getLegendConfigSelector(state);
      if (this.state.legendDirection !== direction) {
        this.setState({
          legendDirection: direction,
        });
      }
      const theme = getChartThemeSelector(state);
      this.setState({
        paddingLeft: theme.chartMargins.left,
        paddingRight: theme.chartMargins.right,
        displayTitles: state.internalChartState?.canDisplayChartTitles(state) ?? true,
      });
      if (state.internalChartState) {
        state.internalChartState.eventCallbacks(state);
      }
    });
  }

  componentDidMount() {
    if (this.chartContainerRef.current) {
      const zIndex = getElementZIndex(this.chartContainerRef.current, document.body);
      this.chartStore.dispatch(onComputedZIndex(zIndex));
    }
  }

  componentWillUnmount() {
    this.unsubscribeToStore();
  }

  componentDidUpdate({ title, description }: Readonly<ChartProps>) {
    if (title !== this.props.title || description !== this.props.description) {
      this.chartStore.dispatch(updateChartTitles(this.props.title, this.props.description));
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
    this.chartStore.dispatch(onExternalPointerEvent(event));
  }

  render() {
    const { size, className } = this.props;
    const containerSizeStyle = getChartSize(size);
    const chartContentClassNames = classNames('echChartContent', className, {
      'echChartContent--column': this.state.legendDirection === LayoutDirection.Horizontal,
    });

    return (
      <Provider store={this.chartStore}>
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
            {/* TODO: Add renderFn to error boundary */}
            <ErrorBoundary>
              <SpecsParser>{this.props.children}</SpecsParser>
              <div className="echContainer" ref={this.chartContainerRef}>
                <ChartContainer getChartContainerRef={this.getChartContainerRef} forwardStageRef={this.chartStageRef} />
              </div>
            </ErrorBoundary>
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
