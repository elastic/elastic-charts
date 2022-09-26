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
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { highContrastColor } from '../../../../common/color_calcs';
import { colorToRgba } from '../../../../common/color_library_wrappers';
import { Colors } from '../../../../common/colors';
import { BasicListener, ElementClickListener, ElementOverListener } from '../../../../specs';
import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_spec';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { MetricStyle } from '../../../../utils/themes/theme';
import { MetricSpec } from '../../specs';
import { chartSize } from '../../state/selectors/chart_size';
import { getMetricSpecs } from '../../state/selectors/data';
import { Metric as MetricComponent } from './metric';

interface StateProps {
  initialized: boolean;
  chartId: string;
  size: {
    width: number;
    height: number;
  };
  specs: MetricSpec[];
  a11y: A11ySettings;
  style: MetricStyle;
  onElementClick?: ElementClickListener;
  onElementOut?: BasicListener;
  onElementOver?: ElementOverListener;
}

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

class Component extends React.Component<StateProps & DispatchProps> {
  static displayName = 'Metric';
  componentDidMount() {
    this.props.onChartRendered();
  }

  componentDidUpdate() {
    this.props.onChartRendered();
  }

  render() {
    const {
      chartId,
      initialized,
      size: { width, height },
      a11y,
      specs,
      style,
      onElementClick,
      onElementOut,
      onElementOver,
    } = this.props;
    if (!initialized || specs.length === 0 || width === 0 || height === 0) {
      return null;
    }
    // ignoring other specs
    const { data } = specs[0];

    const totalRows = data.length;
    const maxColumns = data.reduce((acc, row) => {
      return Math.max(acc, row.length);
    }, 0);

    const panel = { width: width / maxColumns, height: height / totalRows };

    const emptyForegroundColor =
      highContrastColor(colorToRgba(style.background)) === Colors.White.rgba
        ? style.text.lightColor
        : style.text.darkColor;

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
        {data.flatMap((columns, rowIndex) => {
          return [
            ...columns.map((datum, columnIndex) => {
              // fill undefined with empty panels
              const emptyMetricClassName = classNames('echMetric', {
                'echMetric--rightBorder': columnIndex < maxColumns - 1,
                'echMetric--bottomBorder': rowIndex < totalRows - 1,
              });
              return !datum ? (
                <li key={`${columnIndex}-${rowIndex}`} role="presentation">
                  <div className={emptyMetricClassName} style={{ borderColor: style.border }}>
                    <div className="echMetricEmpty" style={{ borderColor: emptyForegroundColor }}></div>
                  </div>
                </li>
              ) : (
                <li key={`${columnIndex}-${rowIndex}`}>
                  <MetricComponent
                    chartId={chartId}
                    datum={datum}
                    totalRows={totalRows}
                    totalColumns={maxColumns}
                    rowIndex={rowIndex}
                    columnIndex={columnIndex}
                    panel={panel}
                    style={style}
                    onElementClick={onElementClick}
                    onElementOut={onElementOut}
                    onElementOver={onElementOver}
                  />
                </li>
              );
            }),
            // fill the grid row with empty panels
            ...Array.from({ length: maxColumns - columns.length }, (_, zeroBasedColumnIndex) => {
              const columnIndex = zeroBasedColumnIndex + columns.length;
              const emptyMetricClassName = classNames('echMetric', {
                'echMetric--bottomBorder': rowIndex < totalRows - 1,
              });
              return (
                <li key={`missing-${columnIndex}-${rowIndex}`} role="presentation">
                  <div className={emptyMetricClassName} style={{ borderColor: style.border }}></div>
                </li>
              );
            }),
          ];
        })}
      </ul>
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
  chartId: '',
  specs: [],
  size: {
    width: 0,
    height: 0,
  },
  a11y: DEFAULT_A11Y_SETTINGS,
  style: LIGHT_THEME.metric,
};

const mapStateToProps = (state: GlobalChartState): StateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  const { onElementClick, onElementOut, onElementOver } = getSettingsSpecSelector(state);
  return {
    initialized: true,
    chartId: state.chartId,
    specs: getMetricSpecs(state),
    size: chartSize(state),
    a11y: getA11ySettingsSelector(state),
    onElementClick,
    onElementOver,
    onElementOut,
    style: getChartThemeSelector(state).metric,
  };
};

/** @internal */
export const Metric = connect(mapStateToProps, mapDispatchToProps)(Component);
