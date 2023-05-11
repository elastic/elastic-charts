/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable-next-line eslint-comments/disable-enable-pair */
/* eslint-disable react/no-array-index-key */

import { scaleLinear } from 'd3-scale';
import { size } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { VerticalBullet, HorizontalBullet, AngularBullet } from './bullet';
import { Header } from './header';
import { Color } from '../../../common/colors';
import { AlignedGrid } from '../../../components/grid/aligned_grid';
import { BasicListener, ElementClickListener, ElementOverListener } from '../../../specs/settings';
import { onChartRendered } from '../../../state/actions/chart';
import { GlobalChartState } from '../../../state/chart_state';
import {
  A11ySettings,
  DEFAULT_A11Y_SETTINGS,
  getA11ySettingsSelector,
} from '../../../state/selectors/get_accessibility_config';
import { getInternalIsInitializedSelector, InitStatus } from '../../../state/selectors/get_internal_is_intialized';
import { Size } from '../../../utils/dimensions';
import { Metric } from '../../metric/renderer/dom/metric';
import { chartSize, getBulletGraphSpec } from '../selectors/chart_size';
import { BulletDatum, BulletGraphSpec, BulletGraphSubtype } from '../spec';

interface StateProps {
  initialized: boolean;
  chartId: string;
  specs: BulletGraphSpec[];
  a11y: A11ySettings;
  size: Size;
  onElementClick?: ElementClickListener;
  onElementOut?: BasicListener;
  onElementOver?: ElementOverListener;
}

interface DispatchProps {
  onChartRendered: typeof onChartRendered;
}

const Component: React.FC<StateProps & DispatchProps> = ({
  initialized,
  size,
  a11y,
  specs: [spec], // ignoring other specs
}) => {
  if (!initialized || !spec) {
    return null;
  }

  const { data, subtype } = spec;
  const BulletComponent =
    subtype === 'horizontal' ? HorizontalBullet : subtype === 'vertical' ? VerticalBullet : AngularBullet;

  return (
    <AlignedGrid<BulletDatum>
      data={data}
      headerComponent={({ datum, stats }) => {
        return switchToMetric(size, stats.rows, stats.columns, subtype) ? null : (
          <Header
            title={datum.title}
            subtitle={datum.subtitle ?? ''}
            value={datum.valueFormatter(datum.value)}
            target={datum.target ? datum.valueFormatter(datum.target) : undefined}
          />
        );
      }}
      contentComponent={({ datum, stats }) => {
        // TODO move to the bullet SVG
        const base = datum.domain.min < 0 && datum.domain.max > 0 ? 0 : NaN;
        const scale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range([0, 1]);
        // @ts-ignore
        const colorScale = scaleLinear().domain([datum.domain.min, datum.domain.max]).range(['#D9C6EF', '#AA87D1']);
        const maxTicks =
          subtype === 'horizontal'
            ? maxHorizontalTick(size.width, stats.columns)
            : maxVerticalTick(size.height, stats.rows);
        const colorTicks = scale.ticks(maxTicks - 1);
        const colorBandSize = 1 / colorTicks.length;
        const { colors } = colorTicks.reduce<{
          last: number;
          colors: Array<{ color: Color; height: number; y: number }>;
        }>(
          (acc, tick) => {
            return {
              last: acc.last + colorBandSize,
              colors: [
                ...acc.colors,
                {
                  color: `${colorScale(tick)}`,
                  height: colorBandSize,
                  y: acc.last,
                },
              ],
            };
          },
          { last: 0, colors: [] },
        );

        return switchToMetric(size, stats.rows, stats.columns, subtype) ? (
          <Metric
            chartId="XX"
            datum={{
              value: datum.value,
              valueFormatter: datum.valueFormatter,
              color: 'black',
              progressBarDirection: subtype === 'horizontal' ? 'horizontal' : 'vertical',
              title: datum.title,
              subtitle: datum.subtitle,
              domainMax: datum.domain.max,
            }}
            totalRows={stats.rows}
            totalColumns={stats.columns}
            columnIndex={stats.columnIndex}
            rowIndex={stats.rowIndex}
            style={{
              background: 'white',
              barBackground: `${colorScale(datum.value)}`,
              border: 'gray',
              minHeight: 0,
              text: {
                lightColor: 'white',
                darkColor: 'black',
              },
              nonFiniteText: 'N/A',
            }}
            panel={{ width: size.width / stats.columns, height: size.height / stats.rows }}
          />
        ) : (
          <BulletComponent
            datum={datum}
            size={{ width: size.width / stats.columns, height: size.height / stats.rows }}
            value={scale(datum.value)}
            colorBands={colors}
            target={datum.target ? scale(datum.target) : NaN}
            ticks={scale.ticks(maxTicks).map(scale)}
            labels={scale.ticks(maxTicks).map((tick) => {
              return {
                text: datum.tickFormatter(tick),
                position: scale(tick),
              };
            })}
          />
        );
      }}
    />
  );
};

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
};

const mapStateToProps = (state: GlobalChartState): StateProps => {
  if (getInternalIsInitializedSelector(state) !== InitStatus.Initialized) {
    return DEFAULT_PROPS;
  }
  // const { onElementClick, onElementOut, onElementOver } = getSettingsSpecSelector(state);
  return {
    initialized: true,
    chartId: state.chartId,
    specs: getBulletGraphSpec(state),
    size: chartSize(state),
    a11y: getA11ySettingsSelector(state),
    // onElementClick,
    // onElementOver,
    // onElementOut,
  };
};

/** @internal */
export const BulletGraphRenderer = connect(mapStateToProps, mapDispatchToProps)(Component);

function maxHorizontalTick(panelWidth: number, columns: number) {
  return panelWidth / columns > 250 ? 4 : 3;
}
function maxVerticalTick(panelHeight: number, rows: number) {
  return panelHeight / rows > 200 ? 4 : 3;
}

function switchToMetric(size: Size, rows: number, columns: number, subtype: BulletGraphSubtype) {
  switch (subtype) {
    case BulletGraphSubtype.horizontal:
      return size.width / columns < 200 || size.height / rows < 100;
    default:
      return size.width / columns < 150 || size.height / rows < 150;
  }
}
