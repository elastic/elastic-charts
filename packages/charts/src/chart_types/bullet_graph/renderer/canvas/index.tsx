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
import { deepEqual } from '../../../../utils/fast_deep_equal';
import type { Point } from '../../../../utils/point';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import type { MetricStyle } from '../../../../utils/themes/theme';
import { Metric } from '../../../metric/renderer/dom/metric';
import { getMetricTextPartDimensions, getSnappedFontSizes } from '../../../metric/renderer/dom/text_measurements';
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

class Component extends React.Component<Props> {
  static displayName = 'Bullet';
  private ctx: CanvasRenderingContext2D | null;
  private readonly devicePixelRatio: number;

  constructor(props: Readonly<Props>) {
    super(props);
    this.ctx = null;
    this.devicePixelRatio = window.devicePixelRatio;
  }

  componentDidMount() {
    this.tryCanvasContext();
    if (this.props.initialized) {
      this.drawCanvas();
      this.props.onChartRendered();
    }
  }

  shouldComponentUpdate(nextProps: Props) {
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

  private tryCanvasContext() {
    const canvas = this.props.forwardStageRef.current;
    this.ctx = canvas && canvas.getContext('2d');
  }

  private drawCanvas() {
    if (this.ctx) {
      renderBullet(this.ctx, this.devicePixelRatio, this.props);
    }
  }

  render() {
    /* eslint-disable prettier/prettier */
    // TODO - Prettier is going crazy on this line, need to investigate
    const {
      initialized,
      size,
      forwardStageRef,
      a11y,
      dimensions,
      spec,
      style,
      backgroundColor,
      locale,
      metricStyle,
    } = this.props;
    /* eslint-enable prettier/prettier */
    const contrastOptions: ColorContrastOptions = {
      lightColor: colorToRgba(metricStyle.textLightColor),
      darkColor: colorToRgba(metricStyle.textDarkColor),
    };

    if (!initialized || size.width === 0 || size.height === 0 || !spec) {
      return null;
    }

    const valueLabels = mergeValueLabels(spec.valueLabels);

    return (
      <figure
        aria-labelledby={a11y.labelId}
        aria-describedby={a11y.descriptionId}
        style={{ width: '100%', height: '100%' }}
      >
        <canvas
          ref={forwardStageRef}
          className="echCanvasRenderer"
          width={size.width * this.devicePixelRatio}
          height={size.height * this.devicePixelRatio}
          style={size}
          // eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role
          role="presentation"
        >
          <ScreenReaderSummary />
        </canvas>
        {dimensions.shouldRenderMetric && (
          <div className="echBulletAsMetric" style={{ width: '100%', height: '100%' }}>
            <AlignedGrid<BulletDatum>
              data={spec.data}
              contentComponent={({ datum, stats }) => {
                const colorScale =
                  this.props.dimensions.rows[stats.rowIndex]?.[stats.columnIndex]?.colorScale ??
                  (() => ({ hex: () => this.props.style.fallbackBandColor })); // should never happen
                const bulletDatum: BulletMetricWProgress = {
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
                  extra: datum.target ? (
                    <span>
                      {valueLabels.target}:{' '}
                      <strong>{(datum.targetFormatter ?? datum.valueFormatter)(datum.target)}</strong>
                    </span>
                  ) : undefined,
                };

                const bulletToMetricStyle = mergePartial(metricStyle, {
                  barBackground: colorScale(datum.value).hex(),
                  emptyBackground: Colors.Transparent.keyword,
                  border: 'gray',
                  minHeight: 0,
                  textLightColor: 'white',
                  textDarkColor: 'black',
                  nonFiniteText: 'N/A',
                  valueFontSize: 'default',
                });
                const panel = { width: size.width / stats.columns, height: size.height / stats.rows };

                const textDimensions = getMetricTextPartDimensions(bulletDatum, panel, bulletToMetricStyle, locale);
                const sizes = getSnappedFontSizes(
                  textDimensions.heightBasedSizes.valueFontSize,
                  panel.height,
                  bulletToMetricStyle,
                );
                textDimensions.heightBasedSizes.valueFontSize = sizes.valueFontSize;
                textDimensions.heightBasedSizes.valuePartFontSize = sizes.valuePartFontSize;

                return (
                  <Metric
                    chartId={`${this.props.chartId}-${stats.rowIndex}-${stats.columnIndex}`}
                    datum={bulletDatum}
                    hasTitles={this.props.hasTitles}
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
              }}
            />
            );
          </div>
        )}
      </figure>
    );
  }
}

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
