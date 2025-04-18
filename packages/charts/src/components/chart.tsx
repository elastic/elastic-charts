/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React, { createRef } from 'react';
import { Provider } from 'react-redux';
import type { Store } from 'redux';
import type { OptionalKeys } from 'utility-types';
import { v4 as uuidv4 } from 'uuid';

import { ChartBackground } from './chart_background';
import { ChartContainer } from './chart_container';
import { ChartResizer } from './chart_resizer';
import { ChartStatus } from './chart_status';
import { Legend } from './legend/legend';
import { getElementZIndex } from './portal/utils';
import { chartTypeSelectors } from '../chart_types/chart_type_selectors';
import { Colors } from '../common/colors';
import type { LegendPositionConfig, PointerEvent } from '../specs';
import type { Spec } from '../specs/spec_type';
import { SpecsParser } from '../specs/specs_parser';
import { updateChartTitles, updateParentDimensions } from '../state/actions/chart_settings';
import { onExternalPointerEvent } from '../state/actions/events';
import { specParsed, upsertSpec } from '../state/actions/specs';
import { onComputedZIndex } from '../state/actions/z_index';
import { createChartStore, type GlobalChartState } from '../state/chart_state';
import { chartSelectorsRegistry } from '../state/selectors/get_internal_chart_state';
import type { ChartSize } from '../utils/chart_size';
import { getChartSize, getFixedChartSize } from '../utils/chart_size';
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
  config?: Spec[];
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

  private chartStore: Store<GlobalChartState>;

  private chartContainerRef: React.RefObject<HTMLDivElement>;

  private chartStageRef: React.RefObject<HTMLCanvasElement>;

  constructor(props: ChartProps) {
    super(props);
    this.chartContainerRef = createRef();
    this.chartStageRef = createRef();

    // set up the chart specific selector overrides
    chartSelectorsRegistry.setChartSelectors(chartTypeSelectors);

    // set up the redux store
    const id = props.id ?? uuidv4();
    this.chartStore = createChartStore(id, this.props.title, this.props.description);
    this.state = {
      legendDirection: LayoutDirection.Vertical,
      paddingLeft: LIGHT_THEME.chartMargins.left,
      paddingRight: LIGHT_THEME.chartMargins.right,
      displayTitles: true,
    };
  }

  componentDidMount() {
    if (this.chartContainerRef.current) {
      const zIndex = getElementZIndex(this.chartContainerRef.current, document.body);
      this.chartStore.dispatch(onComputedZIndex(zIndex));
    }
    if (this.props.config) {
      for (const spec of this.props.config) {
        // align specs with default
        this.chartStore.dispatch(upsertSpec(spec));
      }
      this.chartStore.dispatch(specParsed());
    }
  }

  componentDidUpdate({ title, description, size }: Readonly<ChartProps>) {
    if (title !== this.props.title || description !== this.props.description) {
      this.chartStore.dispatch(updateChartTitles({ title: this.props.title, description: this.props.description }));
    }
    const prevChartSize = getChartSize(size);
    const newChartSize = getFixedChartSize(this.props.size);
    // if the size is specified in pixels then update directly the store
    if (newChartSize && (newChartSize.width !== prevChartSize.width || newChartSize.height !== prevChartSize.height)) {
      this.chartStore.dispatch(updateParentDimensions({ ...newChartSize, top: 0, left: 0 }));
    }
    if (this.props.config) {
      for (const spec of this.props.config) {
        // align specs with default
        this.chartStore.dispatch(upsertSpec(spec));
      }
      this.chartStore.dispatch(specParsed());
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
            {(this.props.config ?? []).length === 0 && <SpecsParser>{this.props.children}</SpecsParser>}
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
