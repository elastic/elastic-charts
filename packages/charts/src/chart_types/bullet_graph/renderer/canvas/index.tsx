/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { RefObject } from 'react';
import React, { useLayoutEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import { bindActionCreators } from 'redux';

import { renderBullet } from './bullet';
import type { ColorContrastOptions } from '../../../../common/color_calcs';
import { colorToRgba } from '../../../../common/color_library_wrappers';
import type { Color } from '../../../../common/colors';
import { Colors } from '../../../../common/colors';
import { ScreenReaderSummary } from '../../../../components/accessibility';
import { AlignedGrid } from '../../../../components/grid/aligned_grid';
import type { ElementOverListener } from '../../../../specs';
import { settingsBuildProps } from '../../../../specs';
import { onChartRendered } from '../../../../state/actions/chart';
import type { GlobalChartState } from '../../../../state/chart_state';
import type { A11ySettings } from '../../../../state/selectors/get_accessibility_config';
import { DEFAULT_A11Y_SETTINGS, getA11ySettingsSelector } from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getResolvedBackgroundColorSelector } from '../../../../state/selectors/get_resolved_background_color';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { mergePartial } from '../../../../utils/common';
import type { Size } from '../../../../utils/dimensions';
import type { Point } from '../../../../utils/point';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { MetricStyle } from '../../../../utils/themes/theme';
import { Metric } from '../../../metric/renderer/dom/metric';
import {
  getFitValueFontSize,
  getMetricTextPartDimensions,
  getSnappedFontSizes,
} from '../../../metric/renderer/dom/text_measurements';
import type { BulletMetricWProgress } from '../../../metric/specs';
import type { ActiveValue } from '../../selectors/get_active_values';
import { getActiveValues } from '../../selectors/get_active_values';
import { getBulletSpec } from '../../selectors/get_bullet_spec';
import { getChartSize } from '../../selectors/get_chart_size';
import type { BulletDimensions } from '../../selectors/get_panel_dimensions';
import { getPanelDimensions } from '../../selectors/get_panel_dimensions';
import { hasChartTitles } from '../../selectors/has_chart_titles';
import type { BulletDatum, BulletSpec } from '../../spec';
import { BulletSubtype, mergeValueLabels } from '../../spec';
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
}

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface OwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = DispatchProps & StateProps & OwnProps;

interface BulletMetricContentProps {
  datum: BulletDatum;
  stats: { rows: number; rowIndex: number; columns: number; columnIndex: number };
  dimensions: BulletDimensions;
  style: BulletStyle;
  spec: BulletSpec;
  metricStyle: MetricStyle;
  size: Size;
  locale: string;
  chartId: string;
  hasTitles: boolean;
  backgroundColor: Color;
  contrastOptions: ColorContrastOptions;
}

const BulletMetricContent = ({
  datum,
  stats,
  dimensions,
  style,
  spec,
  metricStyle,
  size,
  locale,
  chartId,
  hasTitles,
  backgroundColor,
  contrastOptions,
}: BulletMetricContentProps) => {
  const width = size.width / stats.columns;
  const height = size.height / stats.rows;

  const bulletDatum: BulletMetricWProgress = useMemo(() => {
    const valueLabels = mergeValueLabels(spec.valueLabels);

    return {
      value: datum.value,
      target: datum.target,
      valueFormatter: datum.valueFormatter,
      targetFormatter: datum.targetFormatter,
      color: style.barBackground,
      progressBarDirection: spec.subtype === BulletSubtype.vertical ? 'vertical' : 'horizontal',
      title: datum.title,
      subtitle: datum.subtitle,
      domain: datum.domain,
      niceDomain: datum.niceDomain,
      valueLabels,
      extra: datum.target
        ? {
            value: datum.target.toString(),
            label: `${valueLabels.target}:`,
          }
        : undefined,
    };
  }, [datum, style.barBackground, spec.subtype, spec.valueLabels]);

  const colorScale = useMemo(
    () =>
      dimensions.rows[stats.rowIndex]?.[stats.columnIndex]?.colorScale ??
      (() => ({ hex: () => style.fallbackBandColor })), // should never happen
    [dimensions.rows, stats.rowIndex, stats.columnIndex, style.fallbackBandColor],
  );

  const bulletToMetricStyle = useMemo(
    () =>
      mergePartial(metricStyle, {
        fontFamily: style.fontFamily,
        barBackground: colorScale(datum.value).hex(),
        emptyBackground: Colors.Transparent.keyword,
        border: 'gray',
        minHeight: 0,
        textLightColor: 'white',
        textDarkColor: 'black',
        nonFiniteText: 'N/A',
        valueFontSize: 'default',
      }),
    [metricStyle, style.fontFamily, colorScale, datum.value],
  );

  const textDimensions = useMemo(() => {
    const dimensionsForText = getMetricTextPartDimensions(bulletDatum, { width, height }, bulletToMetricStyle, locale);
    const fittedValueFontSize = getFitValueFontSize(
      dimensionsForText.heightBasedSizes.valueFontSize,
      width - dimensionsForText.progressBarWidth,
      dimensionsForText.visibility.availableHeightWithoutValue,
      dimensionsForText.textParts,
      bulletToMetricStyle.minValueFontSize,
      false,
      false,
      dimensionsForText.metricSpacing.panelPadding,
      bulletToMetricStyle.fontFamily,
    );
    const sizes = getSnappedFontSizes(fittedValueFontSize, height, bulletToMetricStyle);

    dimensionsForText.heightBasedSizes.valueFontSize = sizes.valueFontSize;
    dimensionsForText.heightBasedSizes.valuePartFontSize = sizes.valuePartFontSize;

    return dimensionsForText;
  }, [bulletDatum, bulletToMetricStyle, locale, width, height]);

  return (
    <Metric
      chartId={`${chartId}-${stats.rowIndex}-${stats.columnIndex}`}
      datum={bulletDatum}
      hasTitles={hasTitles}
      totalRows={stats.rows}
      totalColumns={stats.columns}
      columnIndex={stats.columnIndex}
      rowIndex={stats.rowIndex}
      style={bulletToMetricStyle}
      backgroundColor={backgroundColor}
      contrastOptions={contrastOptions}
      textDimensions={textDimensions}
    />
  );
};

type BulletMetricGridProps = Omit<BulletMetricContentProps, 'datum' | 'stats' | 'contrastOptions'>;

const BulletMetricGrid = React.memo(
  ({
    dimensions,
    style,
    spec,
    metricStyle,
    size,
    locale,
    chartId,
    hasTitles,
    backgroundColor,
  }: BulletMetricGridProps) => {
    const contrastOptions: ColorContrastOptions = useMemo(
      () => ({
        lightColor: colorToRgba(metricStyle.textLightColor),
        darkColor: colorToRgba(metricStyle.textDarkColor),
      }),
      [metricStyle.textLightColor, metricStyle.textDarkColor],
    );

    const renderMetricContent = ({
      datum,
      stats,
    }: {
      datum: BulletDatum;
      stats: { rows: number; rowIndex: number; columns: number; columnIndex: number };
    }) => (
      <BulletMetricContent
        datum={datum}
        stats={stats}
        dimensions={dimensions}
        style={style}
        spec={spec}
        metricStyle={metricStyle}
        size={size}
        locale={locale}
        chartId={chartId}
        hasTitles={hasTitles}
        backgroundColor={backgroundColor}
        contrastOptions={contrastOptions}
      />
    );

    return <AlignedGrid<BulletDatum> data={spec.data} contentComponent={renderMetricContent} />;
  },
);

BulletMetricGrid.displayName = 'BulletMetricGrid';

const Component = (props: Props) => {
  const { devicePixelRatio } = window;

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
  };
};

/** @internal */
export const BulletRenderer = connect(mapStateToProps, mapDispatchToProps)(Component);
