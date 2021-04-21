/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { LegendItem } from '../../../../common/legend';
import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
import { Rotation } from '../../../../utils/common';
import { Dimensions } from '../../../../utils/dimensions';
import { deepEqual } from '../../../../utils/fast_deep_equal';
import { AnnotationId, AxisId } from '../../../../utils/ids';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { Theme, AxisStyle } from '../../../../utils/themes/theme';
import { AnnotationDimensions } from '../../annotations/types';
import { computeAnnotationDimensionsSelector } from '../../state/selectors/compute_annotations';
import { computeChartDimensionsSelector } from '../../state/selectors/compute_chart_dimensions';
import { computeChartTransformSelector } from '../../state/selectors/compute_chart_transform';
import { computePerPanelGridLinesSelector } from '../../state/selectors/compute_grid_lines';
import { computePanelsSelectors, PanelGeoms } from '../../state/selectors/compute_panels';
import {
  computePerPanelAxesGeomsSelector,
  PerPanelAxisGeoms,
} from '../../state/selectors/compute_per_panel_axes_geoms';
import { computeSeriesGeometriesSelector } from '../../state/selectors/compute_series_geometries';
import { getAxesStylesSelector } from '../../state/selectors/get_axis_styles';
import { getHighlightedSeriesSelector } from '../../state/selectors/get_highlighted_series';
import { getSeriesTypes } from '../../state/selectors/get_series_types';
import { getAnnotationSpecsSelector, getAxisSpecsSelector } from '../../state/selectors/get_specs';
import { isChartEmptySelector } from '../../state/selectors/is_chart_empty';
import { Geometries, Transform } from '../../state/utils/types';
import { LinesGrid } from '../../utils/grid_lines';
import { IndexedGeometryMap } from '../../utils/indexed_geometry_map';
import { AxisSpec, AnnotationSpec, SeriesType } from '../../utils/specs';
import { renderXYChartCanvas2d } from './renderers';

/** @internal */
export interface ReactiveChartStateProps {
  initialized: boolean;
  debug: boolean;
  isChartEmpty: boolean;
  geometries: Geometries;
  geometriesIndex: IndexedGeometryMap;
  theme: Theme;
  chartContainerDimensions: Dimensions;
  rotation: Rotation;
  renderingArea: Dimensions;
  chartTransform: Transform;
  highlightedLegendItem?: LegendItem;
  axesSpecs: AxisSpec[];
  perPanelAxisGeoms: Array<PerPanelAxisGeoms>;
  perPanelGridLines: Array<LinesGrid>;
  axesStyles: Map<AxisId, AxisStyle | null>;
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>;
  annotationSpecs: AnnotationSpec[];
  panelGeoms: PanelGeoms;
  seriesTypes: Set<SeriesType>;
  accessibilityDescription?: string;
  useDefaultSummary: boolean;
  chartId: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}
interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}
const CLIPPING_MARGINS = 0.5;

type AriaProps = {
  [key: string]: string | undefined;
};

type XYChartProps = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;
class XYChartComponent extends React.Component<XYChartProps> {
  static displayName = 'XYChart';

  private ctx: CanvasRenderingContext2D | null;

  // see example https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#Example
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions

  constructor(props: Readonly<XYChartProps>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
  }

  componentDidMount() {
    /*
     * the DOM element has just been appended, and getContext('2d') is always non-null,
     * so we could use a couple of ! non-null assertions but no big plus
     */
    this.tryCanvasContext();
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  shouldComponentUpdate(nextProps: ReactiveChartStateProps) {
    return !deepEqual(this.props, nextProps);
  }

  componentDidUpdate() {
    if (!this.ctx) {
      this.tryCanvasContext();
    }
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  private drawCanvas() {
    if (this.ctx) {
      const { renderingArea, rotation } = this.props;
      const clippings = {
        x: -CLIPPING_MARGINS,
        y: -CLIPPING_MARGINS,
        width: ([90, -90].includes(rotation) ? renderingArea.height : renderingArea.width) + CLIPPING_MARGINS * 2,
        height: ([90, -90].includes(rotation) ? renderingArea.width : renderingArea.height) + CLIPPING_MARGINS * 2,
      };
      renderXYChartCanvas2d(this.ctx, this.devicePixelRatio, clippings, this.props);
    }
  }

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  render() {
    const {
      forwardStageRef,
      initialized,
      isChartEmpty,
      chartContainerDimensions: { width, height },
      seriesTypes,
      accessibilityDescription,
      useDefaultSummary,
      chartId,
      ariaLabel,
      ariaLabelledBy,
      headingLevel,
    } = this.props;

    if (!initialized || isChartEmpty) {
      this.ctx = null;
      return null;
    }

    const chartSeriesTypes =
      seriesTypes.size > 1 ? `Mixed chart: ${[...seriesTypes].join(' and ')} chart` : `${[...seriesTypes]} chart`;
    const chartIdDescription = `${chartId}--description`;
    const chartIdLabel = ariaLabel ? `${chartId}--label` : undefined;
    const idForChartSeriesTypes = `${chartId}--series-types`;

    const ariaProps: AriaProps = {};

    if (ariaLabelledBy || ariaLabel) {
      ariaProps['aria-labelledby'] = ariaLabelledBy ?? chartIdLabel;
    }
    if (accessibilityDescription || useDefaultSummary) {
      ariaProps['aria-describedby'] = `${accessibilityDescription ? chartIdDescription : undefined} ${
        useDefaultSummary ? idForChartSeriesTypes : undefined
      }`;
    }

    const ChartLabel = (heading: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p', id: string, label?: string) => {
      if (!label) return null;
      switch (heading) {
        case 'h1':
          return <h1 id={id}>{label}</h1>;
        case 'h2':
          return <h2 id={id}>{label}</h2>;
        case 'h3':
          return <h3 id={id}>{label}</h3>;
        case 'h4':
          return <h4 id={id}>{label}</h4>;
        case 'h5':
          return <h5 id={id}>{label}</h5>;
        case 'h6':
          return <h6 id={id}>{label}</h6>;
        default:
          return <p id={id}>{label}</p>;
      }
    };
    return (
      <figure {...ariaProps}>
        <canvas
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={width * this.devicePixelRatio}
          height={height * this.devicePixelRatio}
          style={{
            width,
            height,
          }}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        >
          {/* @ts-ignore */}
          <ChartLabel id={chartIdLabel} label={ariaLabel} heading={headingLevel} />
          {(accessibilityDescription || useDefaultSummary) && (
            <div className="echScreenReaderOnly">
              {accessibilityDescription && <p id={chartIdDescription}>{accessibilityDescription}</p>}
              {useDefaultSummary && (
                <dl>
                  <dt>Chart type</dt>
                  <dd id={idForChartSeriesTypes}>{chartSeriesTypes}</dd>
                </dl>
              )}
            </div>
          )}
        </canvas>
      </figure>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const DEFAULT_PROPS: ReactiveChartStateProps = {
  initialized: false,
  debug: false,
  isChartEmpty: true,
  geometries: {
    areas: [],
    bars: [],
    lines: [],
    points: [],
    bubbles: [],
  },
  geometriesIndex: new IndexedGeometryMap(),
  theme: LIGHT_THEME,
  chartContainerDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  rotation: 0 as const,
  renderingArea: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  chartTransform: {
    x: 0,
    y: 0,
    rotate: 0,
  },

  axesSpecs: [],
  perPanelAxisGeoms: [],
  perPanelGridLines: [],
  axesStyles: new Map(),
  annotationDimensions: new Map(),
  annotationSpecs: [],
  panelGeoms: [],
  seriesTypes: new Set(),
  accessibilityDescription: undefined,
  useDefaultSummary: true,
  chartId: '',
  ariaLabel: undefined,
  ariaLabelledBy: undefined,
  headingLevel: 'h2',
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }

  const { geometries, geometriesIndex } = computeSeriesGeometriesSelector(state);
  const {
    debug,
    accessibilityDescription,
    useDefaultSummary,
    ariaLabel,
    ariaLabelledBy,
    headingLevel,
  } = getSettingsSpecSelector(state);

  return {
    initialized: true,
    isChartEmpty: isChartEmptySelector(state),
    debug,
    geometries,
    geometriesIndex,
    theme: getChartThemeSelector(state),
    chartContainerDimensions: getChartContainerDimensionsSelector(state),
    highlightedLegendItem: getHighlightedSeriesSelector(state),
    rotation: getChartRotationSelector(state),
    renderingArea: computeChartDimensionsSelector(state).chartDimensions,
    chartTransform: computeChartTransformSelector(state),
    axesSpecs: getAxisSpecsSelector(state),
    perPanelAxisGeoms: computePerPanelAxesGeomsSelector(state),
    perPanelGridLines: computePerPanelGridLinesSelector(state),
    axesStyles: getAxesStylesSelector(state),
    annotationDimensions: computeAnnotationDimensionsSelector(state),
    annotationSpecs: getAnnotationSpecsSelector(state),
    panelGeoms: computePanelsSelectors(state),
    seriesTypes: getSeriesTypes(state),
    accessibilityDescription,
    useDefaultSummary,
    chartId: getChartIdSelector(state),
    ariaLabel,
    ariaLabelledBy,
    headingLevel,
  };
};

/** @internal */
export const XYChart = connect(mapStateToProps, mapDispatchToProps)(XYChartComponent);
