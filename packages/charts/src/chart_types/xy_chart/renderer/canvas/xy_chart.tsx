/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { LegendItem } from '../../../../common/legend';
import { ScreenReaderSummary } from '../../../../components/accessibility';
import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../../../state/selectors/get_accessibility_config';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
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
import { computePanelsSelectors, PanelGeoms } from '../../state/selectors/compute_panels';
import {
  computePerPanelAxesGeomsSelector,
  PerPanelAxisGeoms,
} from '../../state/selectors/compute_per_panel_axes_geoms';
import { computeSeriesGeometriesSelector } from '../../state/selectors/compute_series_geometries';
import { getAxesStylesSelector } from '../../state/selectors/get_axis_styles';
import { getGridLinesSelector } from '../../state/selectors/get_grid_lines';
import { getHighlightedAnnotationIdsSelector } from '../../state/selectors/get_highlighted_annotation_ids_selector';
import { getHighlightedSeriesSelector } from '../../state/selectors/get_highlighted_series';
import { getAnnotationSpecsSelector, getAxisSpecsSelector } from '../../state/selectors/get_specs';
import { isChartEmptySelector } from '../../state/selectors/is_chart_empty';
import { Geometries, Transform } from '../../state/utils/types';
import { LinesGrid } from '../../utils/grid_lines';
import { IndexedGeometryMap } from '../../utils/indexed_geometry_map';
import { AxisSpec, AnnotationSpec } from '../../utils/specs';
import { AnimationState } from './animations/animation';
import { renderXYChartCanvas2d } from './renderers';
import { hasMostlyRTL } from './utils/has_mostly_rtl';

/** @internal */
export interface ReactiveChartStateProps {
  isRTL: boolean;
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
  hoveredAnnotationIds: string[];
  axesSpecs: AxisSpec[];
  perPanelAxisGeoms: Array<PerPanelAxisGeoms>;
  perPanelGridLines: Array<LinesGrid>;
  axesStyles: Map<AxisId, AxisStyle | null>;
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>;
  annotationSpecs: AnnotationSpec[];
  panelGeoms: PanelGeoms;
  a11ySettings: A11ySettings;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardCanvasRef: RefObject<HTMLCanvasElement>;
}

type XYChartProps = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

class XYChartComponent extends React.Component<XYChartProps> {
  static displayName = 'XYChart';

  private ctx: CanvasRenderingContext2D | null;
  private animationState: AnimationState;

  // see example https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#Example
  private readonly devicePixelRatio: number; // fixme this be no constant: multi-monitor window drag may necessitate modifying the `<canvas>` dimensions

  constructor(props: Readonly<XYChartProps>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
    this.animationState = { rafId: NaN, pool: new Map() };
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

  componentWillUnmount() {
    window.cancelAnimationFrame(this.animationState.rafId);
    this.animationState.pool.clear();
  }

  private drawCanvas() {
    if (this.ctx) {
      renderXYChartCanvas2d(this.ctx, this.devicePixelRatio, this.props, this.animationState);
    }
  }

  private tryCanvasContext() {
    const canvas = this.props.forwardCanvasRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  render() {
    const {
      forwardCanvasRef,
      initialized,
      isChartEmpty,
      chartContainerDimensions: { width, height },
      a11ySettings,
      debug,
      isRTL,
    } = this.props;

    if (!initialized || isChartEmpty) {
      this.ctx = null;
      return null;
    }

    return (
      <>
        <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
          <canvas
            dir={isRTL ? 'rtl' : 'ltr'}
            ref={forwardCanvasRef}
            className="echCanvasRenderer"
            width={width * this.devicePixelRatio}
            height={height * this.devicePixelRatio}
            style={{
              width,
              height,
            }}
            // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
            role="presentation"
          />
          {!debug && <ScreenReaderSummary />}
        </figure>
        {debug && <ScreenReaderSummary />}
      </>
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
  isRTL: false,
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
  hoveredAnnotationIds: [],
  annotationDimensions: new Map(),
  annotationSpecs: [],
  panelGeoms: [],
  a11ySettings: DEFAULT_A11Y_SETTINGS,
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }

  const { geometries, geometriesIndex } = computeSeriesGeometriesSelector(state);
  const { debug } = getSettingsSpecSelector(state);
  const perPanelAxisGeoms = computePerPanelAxesGeomsSelector(state);

  return {
    isRTL: hasMostlyRTL(perPanelAxisGeoms),
    initialized: true,
    isChartEmpty: isChartEmptySelector(state),
    debug,
    geometries,
    geometriesIndex,
    theme: getChartThemeSelector(state),
    chartContainerDimensions: getChartContainerDimensionsSelector(state),
    highlightedLegendItem: getHighlightedSeriesSelector(state),
    hoveredAnnotationIds: getHighlightedAnnotationIdsSelector(state),
    rotation: getChartRotationSelector(state),
    renderingArea: computeChartDimensionsSelector(state).chartDimensions,
    chartTransform: computeChartTransformSelector(state),
    axesSpecs: getAxisSpecsSelector(state),
    perPanelAxisGeoms,
    perPanelGridLines: getGridLinesSelector(state),
    axesStyles: getAxesStylesSelector(state),
    annotationDimensions: computeAnnotationDimensionsSelector(state),
    annotationSpecs: getAnnotationSpecsSelector(state),
    panelGeoms: computePanelsSelectors(state),
    a11ySettings: getA11ySettingsSelector(state),
  };
};

/** @internal */
export const XYChart = connect(mapStateToProps, mapDispatchToProps)(XYChartComponent);
