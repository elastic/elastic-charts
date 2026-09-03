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
import React, { useLayoutEffect } from 'react';
import { connect } from 'react-redux';

import { renderBullet } from './bullet';
import { BulletMetricGrid } from './metric_grid';
import type { Color } from '../../../../common/colors';
import { ScreenReaderSummary } from '../../../../components/accessibility';
import type { ElementOverListener } from '../../../../specs';
import { settingsBuildProps } from '../../../../specs';
import { onChartRendered } from '../../../../state/actions/chart';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getDevicePixelRatioSelector } from '../../../../state/selectors/get_device_pixel_ratio';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getResolvedBackgroundColorSelector } from '../../../../state/selectors/get_resolved_background_color';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import type { Size } from '../../../../utils/dimensions';
import type { Point } from '../../../../utils/point';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { MetricStyle } from '../../../../utils/themes/theme';
import type { ActiveValue } from '../../selectors/get_active_values';
import { getActiveValues } from '../../selectors/get_active_values';
import { getBulletSpec } from '../../selectors/get_bullet_spec';
import { getChartSize } from '../../selectors/get_chart_size';
import type { BulletDimensions } from '../../selectors/get_panel_dimensions';
import { getPanelDimensions } from '../../selectors/get_panel_dimensions';
import { hasChartTitles } from '../../selectors/has_chart_titles';
import type { BulletSpec } from '../../spec';
import type { BulletStyle } from '../../theme';
import type { BulletColorConfig } from '../../utils/color';

interface StateProps {
  initialized: boolean;
  debug: boolean;
  chartId: string;
  hasTitles: boolean;
  spec?: BulletSpec;
  a11y: A11ySettings;
  size: Size;
  dimensions: BulletDimensions;
  activeValues: (ActiveValue | null)[][];
  style: BulletStyle;
  backgroundColor: Color;
  locale: string;
  pointerPosition?: Point;
  colorBands: BulletColorConfig;
  metricStyle: MetricStyle;
  onElementOver?: ElementOverListener;
  devicePixelRatio: number;
}

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface OwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = DispatchProps & StateProps & OwnProps;

const Component = (props: Props) => {
  const {
    initialized,
    debug,
    size,
    forwardStageRef,
    a11y,
    dimensions,
    activeValues,
    spec,
    style,
    backgroundColor,
    locale,
    metricStyle,
    chartId,
    hasTitles,
    onChartRendered: dispatchOnChartRendered,
    devicePixelRatio,
  } = props;

  useLayoutEffect(() => {
    const ctx = forwardStageRef.current?.getContext('2d');

    if (!initialized || !ctx) {
      return;
    }

    renderBullet(ctx, devicePixelRatio, {
      debug,
      spec,
      a11y,
      dimensions,
      activeValues,
      style,
      backgroundColor,
    });
    dispatchOnChartRendered();
  }, [
    initialized,
    devicePixelRatio,
    forwardStageRef,
    debug,
    spec,
    a11y,
    dimensions,
    activeValues,
    style,
    backgroundColor,
    dispatchOnChartRendered,
  ]);

  if (!initialized || size.width === 0 || size.height === 0 || !spec) {
    return null;
  }

  return (
    <figure
      aria-labelledby={a11y.labelId}
      aria-describedby={a11y.descriptionId}
      style={{ width: '100%', height: '100%' }}
    >
      <canvas
        ref={forwardStageRef}
        className="echCanvasRenderer"
        width={size.width * devicePixelRatio}
        height={size.height * devicePixelRatio}
        style={size}
        // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
        role="presentation"
      >
        <ScreenReaderSummary />
      </canvas>
      {dimensions.shouldRenderMetric && (
        <div className="echBulletAsMetric" style={{ width: '100%', height: '100%' }}>
          <BulletMetricGrid
            dimensions={dimensions}
            style={style}
            spec={spec}
            metricStyle={metricStyle}
            size={size}
            locale={locale}
            chartId={chartId}
            hasTitles={hasTitles}
            backgroundColor={backgroundColor}
          />
        </div>
      )}
    </figure>
  );
};

Component.displayName = 'Bullet';

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      onChartRendered,
    },
    dispatch,
  );

const DEFAULT_PROPS: StateProps = {
  initialized: false,
  debug: false,
  chartId: '',
  spec: undefined,
  hasTitles: false,
  size: {
    width: 0,
    height: 0,
  },
  a11y: DEFAULT_A11Y_SETTINGS,
  dimensions: {
    rows: [],
    panel: { height: 0, width: 0 },
    layoutAlignment: [],
    shouldRenderMetric: false,
  },
  activeValues: [],
  style: LIGHT_THEME.bulletGraph,
  metricStyle: LIGHT_THEME.metric,
  backgroundColor: LIGHT_THEME.background.color,
  locale: settingsBuildProps.defaults.locale,
  colorBands: LIGHT_THEME.bulletGraph.colorBands,
  devicePixelRatio: 1,
};

const mapStateToProps = (state: GlobalChartState): StateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  const { bulletGraph: style, metric: metricStyle } = getChartThemeSelector(state);

  const { debug, onElementOver, locale } = getSettingsSpecSelector(state);

  return {
    initialized: true,
    debug,
    chartId: state.chartId,
    hasTitles: hasChartTitles(state),
    spec: getBulletSpec(state),
    size: getChartSize(state),
    a11y: getA11ySettingsSelector(state),
    dimensions: getPanelDimensions(state),
    activeValues: getActiveValues(state),
    style,
    locale,
    backgroundColor: getResolvedBackgroundColorSelector(state),
    colorBands: style.colorBands,
    onElementOver,
    metricStyle,
    devicePixelRatio: getDevicePixelRatioSelector(state),
  };
};

/** @internal */
export const BulletRenderer = connect(mapStateToProps, mapDispatchToProps)(Component);
