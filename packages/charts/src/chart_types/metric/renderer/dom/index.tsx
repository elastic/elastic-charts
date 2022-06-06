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
import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { onChartRendered } from '../../../../state/actions/chart';
import { GlobalChartState } from '../../../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../../../state/selectors/get_accessibility_config';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getInternalIsInitializedSelector, InitStatus } from '../../../../state/selectors/get_internal_is_intialized';
import { LayoutDirection } from '../../../../utils/common';
import { LIGHT_THEME } from '../../../../utils/themes/light_theme';
import { MetricStyle } from '../../../../utils/themes/theme';
import { isMetricWProgress, isMetricWTrend, MetricSpec, ProgressBarMode } from '../../specs';
import { chartSize } from '../../state/selectors/chart_size';
import { getMetricSpecs } from '../../state/selectors/data';
import { ProgressBar } from './progress';
import { SparkLine } from './sparkline';
import { MetricText } from './text';

interface ReactiveChartStateProps {
  initialized: boolean;
  size: {
    width: number;
    height: number;
  };
  specs: MetricSpec[];
  a11y: A11ySettings;
  style: MetricStyle;
}

interface ReactiveChartDispatchProps {
  onChartRendered: typeof onChartRendered;
}

interface ReactiveChartOwnProps {
  forwardStageRef: RefObject<HTMLCanvasElement>;
}

type Props = ReactiveChartStateProps & ReactiveChartDispatchProps & ReactiveChartOwnProps;

class Component extends React.Component<Props> {
  static displayName = 'Metric';
  componentDidMount() {
    this.props.onChartRendered();
  }

  componentDidUpdate() {
    this.props.onChartRendered();
  }

  render() {
    const {
      initialized,
      size: { width, height },
      a11y,
      specs,
      style,
    } = this.props;
    if (!initialized || specs.length === 0 || width === 0 || height === 0) {
      return null;
    }
    // ignoring other specs
    const { data, progressBarMode, progressBarOrientation } = specs[0];

    const maxRows = data.length;
    const maxColumns = data.reduce((acc, curr) => {
      return Math.max(acc, curr.length);
    }, 0);
    const panel = { width: width / maxColumns, height: height / maxRows };

    return (
      <div
        className="echMetricContainer"
        aria-labelledby={a11y.labelId}
        aria-describedby={a11y.descriptionId}
        style={{
          gridTemplateColumns: `repeat(${maxColumns}, minmax(180px, 1fr)`,
          gridTemplateRows: `repeat(${maxRows}, minmax(100px, 1fr)`,
        }}
      >
        {data
          .map((columns, ri) => {
            return [
              ...columns.map((d, ci) => {
                // fill undefined with empty panels
                const emptyMetricClassName = classNames('echMetric', {
                  'echMetric--rightBorder': ci < maxColumns - 1,
                  'echMetric--bottomBorder': ri < maxRows - 1,
                });
                if (!d) {
                  return <div key={`empty-${ci}`} className={emptyMetricClassName}></div>;
                }

                const metricPanelClassName = classNames(emptyMetricClassName, {
                  'echMetric--small': progressBarMode === ProgressBarMode.Small,
                  'echMetric--vertical': progressBarOrientation === LayoutDirection.Vertical,
                  'echMetric--horizontal': progressBarOrientation === LayoutDirection.Horizontal,
                });

                return (
                  <div
                    key={`${d.title}${d.subtitle}${d.color}${ci}`}
                    className={metricPanelClassName}
                    style={{ backgroundColor: style.background }}
                  >
                    {isMetricWTrend(d) && <SparkLine datum={d} curve="linear" />}
                    {isMetricWProgress(d) && progressBarMode !== ProgressBarMode.None && (
                      <ProgressBar
                        mode={progressBarMode}
                        orientation={progressBarOrientation}
                        datum={d}
                        barBg={style.barBg}
                      />
                    )}
                    {isMetricWProgress(d) && progressBarMode === ProgressBarMode.None && (
                      <ProgressBar
                        mode={progressBarMode}
                        orientation={progressBarOrientation}
                        barBg={style.barBg}
                        datum={{
                          value: 100,
                          domain: [100, 100],
                          color: d.color,
                        }}
                      />
                    )}
                    <MetricText
                      datum={d}
                      panel={panel}
                      style={style}
                      progressBarMode={progressBarMode}
                      progressBarOrientation={progressBarOrientation}
                    />
                  </div>
                );
              }),
              // fill the grid row with empty panels
              ...Array.from({ length: maxColumns - columns.length }, (d, ci) => {
                const emptyMetricClassName = classNames('echMetric', {
                  'echMetric--rightBorder': columns.length + ci < maxColumns - 1,
                  'echMetric--bottomBorder': ri < maxRows - 1,
                });
                return <div key={`missing-${ci}`} className={emptyMetricClassName}></div>;
              }),
            ];
          })
          .flat()}
      </div>
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
  specs: [],
  size: {
    width: 0,
    height: 0,
  },
  a11y: DEFAULT_A11Y_SETTINGS,
  style: LIGHT_THEME.metric,
};
const mapStateToProps = (state: GlobalChartState): ReactiveChartStateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  return {
    initialized: true,
    specs: getMetricSpecs(state),
    size: chartSize(state),
    a11y: getA11ySettingsSelector(state),
    style: getChartThemeSelector(state).metric,
  };
};

/** @internal */
export const Metric = connect(mapStateToProps, mapDispatchToProps)(Component);
