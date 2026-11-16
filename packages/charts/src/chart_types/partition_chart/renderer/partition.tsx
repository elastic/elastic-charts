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

import { ScreenReaderPartitionTable } from './dom/screen_reader_partition_table';
import { renderLinearPartition } from './linear_renderers';
import { renderPartition } from './renderers';
import { renderWrappedPartition } from './wrapped_renderers';
import type { Color } from '../../../common/colors';
import { Colors } from '../../../common/colors';
import { ScreenReaderSummary } from '../../../components/accessibility';
import { Stage } from '../../../components/stage';
import type { Painter, RendererType } from '../../../renderers/painter';
import type { SettingsSpec } from '../../../specs/settings';
import { onChartRendered } from '../../../state/actions/chart';
import type { LegendPath } from '../../../state/actions/legend';
import type { GlobalChartState } from '../../../state/chart_state';
import type { StageElement } from '../../../state/internal_chart_renderer';
import type { A11ySettings } from '../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../state/selectors/get_accessibility_config';
import { getChartContainerDimensionsSelector } from '../../../state/selectors/get_chart_container_dimensions';
import { getChartThemeSelector } from '../../../state/selectors/get_chart_theme';
import { getDevicePixelRatioSelector } from '../../../state/selectors/get_device_pixel_ratio';
import { getHighlightedPaths } from '../../../state/selectors/get_highlighted_paths';
import { getInternalIsInitializedSelector, InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { getRendererSelector } from '../../../state/selectors/get_renderer';
import { getSettingsSpecSelector } from '../../../state/selectors/get_settings_spec';
import type { Dimensions } from '../../../utils/dimensions';
import { LIGHT_THEME } from '../../../utils/themes/light_theme';
import type { PartitionStyle } from '../../../utils/themes/partition';
import type { ShapeViewModel, SmallMultiplesDescriptors } from '../layout/types/viewmodel_types';
import { hasMostlyRTLLabels, nullShapeViewModel } from '../layout/types/viewmodel_types';
import { isSimpleLinear, isWaffle } from '../layout/viewmodel/viewmodel';
import { partitionDrilldownFocus, partitionMultiGeometries } from '../state/selectors/geometries';

/** @internal */
export interface ContinuousDomainFocus {
  currentFocusX0: number;
  currentFocusX1: number;
  prevFocusX0: number;
  prevFocusX1: number;
}

/** @internal */
export interface IndexedContinuousDomainFocus extends ContinuousDomainFocus, SmallMultiplesDescriptors {}

interface ReactiveChartStateProps {
  chartId: string;
  renderer: RendererType;
  isRTL: boolean;
  initialized: boolean;
  geometries: ShapeViewModel;
  geometriesFoci: ContinuousDomainFocus[];
  multiGeometries: ShapeViewModel[];
  chartDimensions: Dimensions;
  a11ySettings: A11ySettings;
  debug: SettingsSpec['debug'];
  background: Color;
  highlightedPaths: LegendPath[];
  legendStrategy: SettingsSpec['legendStrategy'];
  flatLegend: SettingsSpec['flatLegend'];
  partitionStyle: PartitionStyle;
  devicePixelRatio: number;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<StageElement>;
}

type PartitionProps = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

/** @internal */
export type AnimationState = { rafId: number };

interface PartitionState {
  /** svg only: progress of the current drill-down focus change, 1 when settled */
  drilldownTime: number;
}

class PartitionComponent extends React.Component<PartitionProps, PartitionState> {
  static displayName = 'Partition';

  // firstRender = true; // this will be useful for stable resizing of treemaps
  private readonly animationState: AnimationState = { rafId: NaN };

  state: PartitionState = { drilldownTime: 1 };

  componentDidUpdate(prevProps: PartitionProps) {
    const { renderer, geometriesFoci, multiGeometries } = this.props;
    const duration = multiGeometries[0]?.animation?.duration ?? 0;
    const [focus] = geometriesFoci;
    const focusChanged =
      !!focus && (focus.currentFocusX0 !== focus.prevFocusX0 || focus.currentFocusX1 !== focus.prevFocusX1);
    if (renderer === 'svg' && duration > 0 && focusChanged && prevProps.geometriesFoci !== geometriesFoci) {
      this.animateDrilldown(duration);
    }
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.animationState.rafId);
  }

  /** drives the svg frames of a focus change; the canvas backend runs its own loop in the renderer */
  private animateDrilldown(duration: number) {
    window.cancelAnimationFrame(this.animationState.rafId);
    this.setState({ drilldownTime: 0 });
    this.animationState.rafId = window.requestAnimationFrame((epochStartTime) => {
      const frame = (t: number) => {
        const drilldownTime = Math.max(0, Math.min(1, (t - epochStartTime) / duration));
        this.setState({ drilldownTime });
        if (drilldownTime < 1) this.animationState.rafId = window.requestAnimationFrame(frame);
      };
      this.animationState.rafId = window.requestAnimationFrame(frame);
    });
  }

  private paint = (painter: Painter) => {
    const {
      background,
      multiGeometries,
      geometriesFoci,
      highlightedPaths,
      legendStrategy,
      flatLegend,
      partitionStyle,
    } = this.props;
    painter.clear(background);
    multiGeometries.forEach((geometries, geometryIndex) => {
      const focus = geometriesFoci[geometryIndex];
      if (!focus) return;

      if (isSimpleLinear(geometries.layout, geometries.style.fillLabel, geometries.layers)) {
        renderLinearPartition(
          painter,
          geometries,
          focus,
          highlightedPaths,
          legendStrategy,
          flatLegend,
          partitionStyle,
          this.animationState,
          this.state.drilldownTime,
        );
      } else if (isWaffle(geometries.layout)) {
        renderWrappedPartition(painter, geometries, highlightedPaths, legendStrategy, flatLegend, partitionStyle);
      } else {
        renderPartition(painter, geometries, highlightedPaths, legendStrategy, flatLegend, partitionStyle);
      }
    });
  };

  render() {
    const {
      forwardStageRef,
      initialized,
      chartDimensions: { width, height },
      a11ySettings,
      isRTL,
      renderer,
      devicePixelRatio,
      chartId,
      onChartRendered: rendered,
    } = this.props;
    return width === 0 || height === 0 || !initialized ? null : (
      <figure aria-labelledby={a11ySettings.labelId} aria-describedby={a11ySettings.descriptionId}>
        <Stage
          renderer={renderer}
          width={width}
          height={height}
          devicePixelRatio={devicePixelRatio}
          dir={isRTL ? 'rtl' : 'ltr'}
          idPrefix={`${chartId}-partition`}
          forwardStageRef={forwardStageRef}
          paint={this.paint}
          onRendered={rendered}
        />
        <ScreenReaderSummary />
        <ScreenReaderPartitionTable />
      </figure>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReactiveChartDispatchProps =>
  bindActionCreators({ onChartRendered }, dispatch);

const DEFAULT_PROPS: ReactiveChartStateProps = {
  chartId: '',
  renderer: 'canvas',
  isRTL: false,
  initialized: false,
  geometries: nullShapeViewModel(),
  geometriesFoci: [],
  multiGeometries: [],
  chartDimensions: {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  },
  a11ySettings: DEFAULT_A11Y_SETTINGS,
  debug: false,
  background: Colors.Transparent.keyword,
  highlightedPaths: [],
  legendStrategy: undefined,
  flatLegend: undefined,
  partitionStyle: LIGHT_THEME.partition,
  devicePixelRatio: 1,
};

const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  const multiGeometries = partitionMultiGeometries(state);
  const settings = getSettingsSpecSelector(state);
  const theme = getChartThemeSelector(state);

  return {
    chartId: state.chartId,
    renderer: getRendererSelector(state),
    isRTL: hasMostlyRTLLabels(multiGeometries),
    initialized: true,
    geometries: multiGeometries[0] ?? nullShapeViewModel(),
    multiGeometries,
    chartDimensions: getChartContainerDimensionsSelector(state),
    geometriesFoci: partitionDrilldownFocus(state),
    a11ySettings: getA11ySettingsSelector(state),
    debug: settings.debug,
    background: theme.background.color,
    highlightedPaths: getHighlightedPaths(state),
    legendStrategy: settings.legendStrategy,
    flatLegend: settings.flatLegend,
    partitionStyle: theme.partition,
    devicePixelRatio: getDevicePixelRatioSelector(state),
  };
};

/** @internal */
export const Partition = connect(mapStateToProps, mapDispatchToProps)(PartitionComponent);
