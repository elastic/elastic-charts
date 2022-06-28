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
import { getSettingsSpecSelector } from '../../../../state/selectors/get_settings_specs';
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
    const totalColumns = data.reduce((acc, curr) => {
      return Math.max(acc, curr.length);
    }, 0);

    const panel = { width: width / totalColumns, height: height / totalRows };

    return (
      // eslint-disable-next-line jsx-a11y/no-redundant-roles
      <ul
        role="list"
        className="echMetricContainer"
        aria-labelledby={a11y.labelId}
        aria-describedby={a11y.descriptionId}
        style={{
          gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr)`,
          gridTemplateRows: `repeat(${totalRows}, minmax(64px, 1fr)`,
        }}
      >
        {data
          .map((columns, rowIndex) => {
            return [
              ...columns.map((datum, columnIndex) => {
                // fill undefined with empty panels
                const emptyMetricClassName = classNames('echMetric', {
                  'echMetric--rightBorder': columnIndex < totalColumns - 1,
                  'echMetric--bottomBorder': rowIndex < totalRows - 1,
                });
                if (!datum) {
                  return (
                    <li key={`empty-${columnIndex}`} role="presentation">
                      <div className={emptyMetricClassName}></div>
                    </li>
                  );
                }
                return (
                  <li key={`${datum.title}${datum.subtitle}${datum.color}${columnIndex}`}>
                    <MetricComponent
                      chartId={chartId}
                      datum={datum}
                      totalRows={totalRows}
                      totalColumns={totalColumns}
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
              ...Array.from({ length: totalColumns - columns.length }, (_, columIndex) => {
                const emptyMetricClassName = classNames('echMetric', {
                  'echMetric--rightBorder': columns.length + columIndex < totalColumns - 1,
                  'echMetric--bottomBorder': rowIndex < totalRows - 1,
                });
                return (
                  <li key={`missing-${columIndex}`} role="presentation">
                    <div className={emptyMetricClassName}></div>
                  </li>
                );
              }),
            ];
          })
          .flat()}
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
