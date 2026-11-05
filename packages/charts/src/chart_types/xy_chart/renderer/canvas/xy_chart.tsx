/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { Dispatch } from '@reduxjs/toolkit';
import { bindActionCreators } from '@reduxjs/toolkit';
import type { RefObject } from 'react';
import React from 'react';
import { connect } from 'react-redux';

import type { AnimationState } from './animations/animation';
import { renderXYChart } from './renderers';
import { hasMostlyRTL } from './utils/has_mostly_rtl';
import type { SeriesKey } from '../../../../common/series_id';
import { ScreenReaderSummary } from '../../../../components/accessibility';
import { Stage } from '../../../../components/stage';
import type { Painter, RendererType } from '../../../../renderers/painter';
import { settingsBuildProps } from '../../../../specs';
import { onChartRendered } from '../../../../state/actions/chart';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { StageElement } from '../../../../state/internal_chart_renderer';
import type { PanelGeoms } from '../../../../state/selectors/compute_panels';
import { computePanelsSelectors } from '../../../../state/selectors/compute_panels';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartRotationSelector } from '../../../../state/selectors/get_chart_rotation';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getDevicePixelRatioSelector } from '../../../../state/selectors/get_device_pixel_ratio';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getRendererSelector } from '../../../../state/selectors/get_renderer';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { Rotation } from '../../../../utils/common';
import type { Dimensions } from '../../../../utils/dimensions';
import { deepEqual } from '../../../../utils/fast_deep_equal';
import type { AnnotationId, AxisId } from '../../../../utils/ids';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { Theme, AxisStyle } from '../../../../utils/themes/theme';
import type { AnnotationDimensions } from '../../annotations/types';
import { computeAnnotationDimensionsSelector } from '../../state/selectors/compute_annotations';
import { computeChartLayoutSelector } from '../../state/selectors/compute_chart_layout';
import { computeChartTransformSelector } from '../../state/selectors/compute_chart_transform';
import type { PerPanelAxisGeoms } from '../../state/selectors/compute_per_panel_axes_geoms';
import { computePerPanelAxesGeomsSelector } from '../../state/selectors/compute_per_panel_axes_geoms';
import { computeSeriesGeometriesSelector } from '../../state/selectors/compute_series_geometries';
import { getAxesStylesSelector } from '../../state/selectors/get_axis_styles';
import { getGridLinesSelector } from '../../state/selectors/get_grid_lines';
import { getHighlightedAnnotationIdsSelector } from '../../state/selectors/get_highlighted_annotation_ids_selector';
import { getHighlightedSeriesSelector } from '../../state/selectors/get_highlighted_series';
import { getAnnotationSpecsSelector, getAxisSpecsSelector } from '../../state/selectors/get_specs';
import { isChartEmptySelector } from '../../state/selectors/is_chart_empty';
import type { Geometries, Transform } from '../../state/utils/types';
import type { LinesGrid } from '../../utils/grid_lines';
import { IndexedGeometryMap } from '../../utils/indexed_geometry_map';
import type { AxisSpec, AnnotationSpec } from '../../utils/specs';

/** @internal */
export interface ReactiveChartStateProps {
  chartId: string;
  renderer: RendererType;
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
  highlightedItems: SeriesKey[];
  hoveredAnnotationIds: string[];
  axesSpecs: AxisSpec[];
  perPanelAxisGeoms: Array<PerPanelAxisGeoms>;
  perPanelGridLines: Array<LinesGrid>;
  axesStyles: Map<AxisId, AxisStyle | null>;
  annotationDimensions: Map<AnnotationId, AnnotationDimensions>;
  annotationSpecs: AnnotationSpec[];
  panelGeoms: PanelGeoms;
  a11ySettings: A11ySettings;
  locale: string;
  devicePixelRatio: number;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardCanvasRef: RefObject<StageElement>;
}

type XYChartProps = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

class XYChartComponent extends React.Component<XYChartProps> {
  static displayName = 'XYChart';

  private readonly animationState: AnimationState = { rafId: NaN, pool: new Map() };

  shouldComponentUpdate(nextProps: ReactiveChartStateProps) {
    return !deepEqual(this.props, nextProps);
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.animationState.rafId);
    this.animationState.pool.clear();
  }

  private paint = (painter: Painter) => {
    renderXYChart(painter, this.props, this.animationState);
  };

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
      renderer,
      devicePixelRatio,
      chartId,
      onChartRendered: rendered,
    } = this.props;

    if (!initialized || isChartEmpty) {
      return null;
    }

    return (
      <>
        <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
          <Stage
            renderer={renderer}
            width={width}
            height={height}
            devicePixelRatio={devicePixelRatio}
            dir={isRTL ? 'rtl' : 'ltr'}
            idPrefix={`${chartId}-xy`}
            forwardStageRef={forwardCanvasRef}
            paint={this.paint}
            onRendered={rendered}
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
  chartId: '',
  renderer: 'canvas',
  isRTL: false,
  initialized: false,
  debug: false,
  isChartEmpty: true,
  geometries: {
    areas: [],
    bars: [],
    lines: [],
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
  highlightedItems: [],
  axesSpecs: [],
  perPanelAxisGeoms: [],
  perPanelGridLines: [],
  axesStyles: new Map(),
  hoveredAnnotationIds: [],
  annotationDimensions: new Map(),
  annotationSpecs: [],
  panelGeoms: [],
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  locale: settingsBuildProps.defaults.locale,
  devicePixelRatio: 1,
};

/**
 * The props the XY renderer draws from. The chart state must be initialized.
 * @internal
 */
export const getXYChartRendererProps = (state: GlobalChartState): ReactiveChartStateProps => {
  const { geometries, geometriesIndex } = computeSeriesGeometriesSelector(state);
  const { debug, locale } = getSettingsSpecSelector(state);
  const perPanelAxisGeoms = computePerPanelAxesGeomsSelector(state);

  return {
    chartId: state.chartId,
    renderer: getRendererSelector(state),
    locale,
    isRTL: hasMostlyRTL(perPanelAxisGeoms),
    initialized: true,
    isChartEmpty: isChartEmptySelector(state),
    debug,
    geometries,
    geometriesIndex,
    theme: getChartThemeSelector(state),
    chartContainerDimensions: getChartContainerDimensionsSelector(state),
    highlightedItems: getHighlightedSeriesSelector(state),
    hoveredAnnotationIds: getHighlightedAnnotationIdsSelector(state),
    rotation: getChartRotationSelector(state),
    renderingArea: computeChartLayoutSelector(state).dimensions.chartDimensions,
    chartTransform: computeChartTransformSelector(state),
    axesSpecs: getAxisSpecsSelector(state),
    perPanelAxisGeoms,
    perPanelGridLines: getGridLinesSelector(state),
    axesStyles: getAxesStylesSelector(state),
    annotationDimensions: computeAnnotationDimensionsSelector(state),
    annotationSpecs: getAnnotationSpecsSelector(state),
    panelGeoms: computePanelsSelectors(state),
    a11ySettings: getA11ySettingsSelector(state),
    devicePixelRatio: getDevicePixelRatioSelector(state),
  };
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps =>
  getInternalIsInitializedSelector(state) === InitStatus.Initialized ? getXYChartRendererProps(state) : DEFAULT_PROPS;

/** @internal */
export const XYChart = connect(mapStateToProps, mapDispatchToProps)(XYChartComponent);
