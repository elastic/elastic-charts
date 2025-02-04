/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
/* eslint-disable react/no-array-index-key */

import classNames from 'classnames';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Metric as MetricComponent } from './metric';
import {
  getFittedFontSizes,
  getFitValueFontSize,
  getFixedFontSizes,
  getMetricTextPartDimensions,
  getSnappedFontSizes,
  MetricTextDimensions,
} from './text_measurements';
import { ColorContrastOptions, combineColors, highContrastColor } from '../../../../common/color_calcs';
import { colorToRgba, RGBATupleToString } from '../../../../common/color_library_wrappers';
import { Color } from '../../../../common/colors';
import { settingsBuildProps } from '../../../../specs/default_settings_spec';
import { BasicListener, ElementClickListener, ElementOverListener } from '../../../../specs/settings';
import { onChartRendered as onChartRenderedAction } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getResolvedBackgroundColorSelector } from '../../../../state/selectors/get_resolved_background_color';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { MetricStyle } from '../../../../utils/themes/theme';
import { MetricDatum, MetricSpec } from '../../specs';
import { chartSize } from '../../state/selectors/chart_size';
import { getMetricSpecs } from '../../state/selectors/data';
import { hasChartTitles } from '../../state/selectors/has_chart_titles';

interface StateProps {
  initialized: boolean;
  chartId: string;
  hasTitles: boolean;
  size: {
    width: number;
    height: number;
  };
  specs: MetricSpec[];
  a11y: A11ySettings;
  style: MetricStyle;
  backgroundColor: Color;
  locale: string;
  onElementClick?: ElementClickListener;
  onElementOut?: BasicListener;
  onElementOver?: ElementOverListener;
}

interface DispatchProps {
  onChartRendered: typeof onChartRenderedAction;
}

function Component({
  chartId,
  hasTitles,
  initialized,
  size: { width, height },
  a11y,
  specs: [spec],
  style,
  backgroundColor,
  onElementClick,
  onElementOut,
  onElementOver,
  locale,
  onChartRendered,
}: StateProps & DispatchProps) {
  useEffect(() => {
    onChartRendered();
  });

  if (!initialized || !spec || width === 0 || height === 0) {
    return null;
  }

  const { data } = spec;

  const totalRows = data.length;
  const maxColumns = data.reduce((acc, row) => Math.max(acc, row.length), 0);

  const panel = { width: width / maxColumns, height: height / totalRows };
  const contrastOptions: ColorContrastOptions = {
    lightColor: colorToRgba(style.textLightColor),
    darkColor: colorToRgba(style.textDarkColor),
  };

  const emptyBackgroundRGBA = combineColors(colorToRgba(style.emptyBackground), colorToRgba(backgroundColor));
  const emptyBackground = RGBATupleToString(emptyBackgroundRGBA);
  const emptyForegroundColor = highContrastColor(emptyBackgroundRGBA, undefined, contrastOptions).color;

  const metricsConfigs = data.reduce<{
    fittedValueFontSize: number;
    configs: Array<
      | { key: string; className: string; type: 'left-empty' | 'right-empty' }
      | {
          key: string;
          rowIndex: number;
          type: 'metric';
          columnIndex: number;
          textDimensions: MetricTextDimensions;
          datum: MetricDatum;
        }
    >;
  }>(
    (acc, columns, rowIndex) => {
      acc.configs = acc.configs.concat(
        columns.map((datum, columnIndex) => {
          const key = `${columnIndex}-${rowIndex}`;
          if (!datum) {
            // fill with empty panels at the beginning of the row
            return {
              key,
              type: 'left-empty',
              className: classNames('echMetric', {
                'echMetric--rightBorder': columnIndex < maxColumns - 1,
                'echMetric--bottomBorder': rowIndex < totalRows - 1,
                'echMetric--topBorder': hasTitles && rowIndex === 0,
              }),
            };
          }
          const textDimensions = getMetricTextPartDimensions(datum, panel, style, locale);

          const fontSize = getFitValueFontSize(
            textDimensions.heightBasedSizes.valueFontSize,
            panel.width - textDimensions.progressBarWidth,
            textDimensions.visibility.gapHeight,
            textDimensions.textParts,
            style.minValueFontSize,
            datum.valueIcon !== undefined,
          );
          acc.fittedValueFontSize = Math.min(acc.fittedValueFontSize, fontSize);

          return {
            type: 'metric',
            key,
            datum,
            columnIndex,
            rowIndex,
            textDimensions,
          };
        }),
        // adding all missing panels to fill up the row
        Array.from({ length: maxColumns - columns.length }, (_, zeroBasedColumnIndex) => {
          const columnIndex = zeroBasedColumnIndex + columns.length;
          return {
            key: `missing-${columnIndex}-${rowIndex}`,
            type: 'right-empty',
            className: classNames('echMetric', {
              'echMetric--bottomBorder': rowIndex < totalRows - 1,
              'echMetric--topBorder': hasTitles && rowIndex === 0,
            }),
          };
        }),
      );

      return acc;
    },
    { configs: [], fittedValueFontSize: Number.MAX_SAFE_INTEGER },
  );

  // update the configs with the globally aligned valueFontSize
  const { valueFontSize, valuePartFontSize } =
    typeof style.valueFontSize === 'number'
      ? getFixedFontSizes(style.valueFontSize)
      : style.valueFontSize === 'default'
        ? getSnappedFontSizes(metricsConfigs.fittedValueFontSize, panel.height, style)
        : getFittedFontSizes(metricsConfigs.fittedValueFontSize);

  metricsConfigs.configs.forEach((config) => {
    if (config.type === 'metric') {
      config.textDimensions.heightBasedSizes.valueFontSize = valueFontSize;
      config.textDimensions.heightBasedSizes.valuePartFontSize = valuePartFontSize;
    }
  });

  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <ul
      role="list"
      className="echMetricContainer"
      aria-labelledby={a11y.labelId}
      aria-describedby={a11y.descriptionId}
      style={{
        gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr)`,
        gridTemplateRows: `repeat(${totalRows}, minmax(${style.minHeight}px, 1fr)`,
      }}
    >
      {metricsConfigs.configs.map((config) => {
        return config.type !== 'metric' ? (
          <li key={config.key} role="presentation">
            <div className={config.className} style={{ borderColor: style.border, backgroundColor: emptyBackground }}>
              {config.type === 'left-empty' && (
                <div className="echMetricEmpty" style={{ borderColor: emptyForegroundColor.keyword }}></div>
              )}
            </div>
          </li>
        ) : (
          <li key={config.key}>
            <MetricComponent
              chartId={chartId}
              hasTitles={hasTitles}
              datum={config.datum}
              totalRows={totalRows}
              totalColumns={maxColumns}
              rowIndex={config.rowIndex}
              columnIndex={config.columnIndex}
              style={style}
              backgroundColor={backgroundColor}
              contrastOptions={contrastOptions}
              onElementClick={onElementClick}
              onElementOut={onElementOut}
              onElementOver={onElementOver}
              textDimensions={config.textDimensions}
            />
          </li>
        );
      })}
    </ul>
  );
}

Component.displayName = 'Metric';

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      onChartRendered: onChartRenderedAction,
    },
    dispatch,
  );

const DEFAULT_PROPS: StateProps = {
  initialized: false,
  chartId: '',
  hasTitles: false,
  specs: [],
  size: {
    width: 0,
    height: 0,
  },
  a11y: DEFAULT_A11Y_SETTINGS,
  style: LIGHT_THEME.metric,
  backgroundColor: LIGHT_THEME.background.color,
  locale: settingsBuildProps.defaults.locale,
};

const mapStateToProps = (state: GlobalChartState): StateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  const { onElementClick, onElementOut, onElementOver, locale } = getSettingsSpecSelector(state);
  const { metric: style } = getChartThemeSelector(state);
  return {
    initialized: true,
    chartId: state.chartId,
    hasTitles: hasChartTitles(state),
    specs: getMetricSpecs(state),
    size: chartSize(state),
    a11y: getA11ySettingsSelector(state),
    onElementClick,
    onElementOver,
    onElementOut,
    backgroundColor: getResolvedBackgroundColorSelector(state),
    style,
    locale,
  };
};

/** @internal */
export const Metric = connect(mapStateToProps, mapDispatchToProps)(Component);
