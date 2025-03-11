/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiIcon } from '@elastic/eui';
import { boolean, number } from '@storybook/addon-knobs';
import moment from 'moment';
import React from 'react';

import type { LineAnnotationSpec } from '@elastic/charts';
import {
  Chart,
  Axis,
  Settings,
  HistogramBarSeries,
  Position,
  ScaleType,
  LineAnnotation,
  AnnotationDomainType,
} from '@elastic/charts';
import { isVerticalAxis } from '@elastic/charts/src/chart_types/xy_chart/utils/axis_type_utils';

import type { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

const annotationStyle = {
  line: {
    strokeWidth: 1,
    stroke: 'red',
    opacity: 1,
  },
};

const iconMap = {
  [Position.Top]: 'arrowDown',
  [Position.Right]: 'arrowLeft',
  [Position.Bottom]: 'arrowUp',
  [Position.Left]: 'arrowRight',
};

/**
 * Used to rotate text while maintaining correct parent dimensions
 * https://www.kizu.ru/rotated-text/
 */
const getMarkerBody =
  (valueCb: (v: any) => string, isVertical: boolean): LineAnnotationSpec['markerBody'] =>
  ({ dataValue }) =>
    isVertical ? (
      <div
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          width: '1.5em',
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            whiteSpace: 'nowrap',
            transform: 'translate(0, 100%) rotate(-90deg)',
            transformOrigin: '0 0',
          }}
        >
          {valueCb(dataValue)}
          <div
            style={{
              float: 'left',
              marginTop: '100%',
            }}
          />
        </div>
      </div>
    ) : (
      <div>{valueCb(dataValue)}</div>
    );

/** formats values correctly for any rotation/side combination */
const looseFormatter = (d: any) => (d < 100 ? String(d) : moment(d).format('L'));

export const Example: ChartsStory = (_, { title, description }) => {
  const maxMetric = 30;
  const debug = boolean('Debug', false);
  const showLegend = boolean('show legend', true);
  const rotation = customKnobs.enum.rotation();
  const side = customKnobs.enum.position('Side', Position.Bottom);
  const start = moment('4/1/2020').startOf('d');
  const metric = number('Annotation metric', maxMetric, { step: 1, min: 0, max: maxMetric, range: true });
  const isVerticalSide = isVerticalAxis(side);
  const isYDomain = rotation === -90 || rotation === 90 ? !isVerticalSide : isVerticalSide;

  return (
    <Chart title={title} description={description}>
      <Settings debug={debug} showLegend={showLegend} rotation={rotation} baseTheme={useBaseTheme()} />
      <Axis
        id="count"
        maximumFractionDigits={0}
        tickFormat={looseFormatter}
        position={side === Position.Right ? Position.Right : Position.Left}
      />
      <Axis id="x" tickFormat={looseFormatter} position={side === Position.Top ? Position.Top : Position.Bottom} />
      {isYDomain ? (
        <LineAnnotation
          id="annotation_y"
          domainType={AnnotationDomainType.YDomain}
          dataValues={[{ dataValue: metric }]}
          style={annotationStyle}
          hideTooltips
          marker={<EuiIcon type={iconMap[side]} />}
          markerBody={getMarkerBody((v) => `The value is ${v} right here!`, isVerticalSide)}
        />
      ) : (
        <LineAnnotation
          id="annotation_x"
          domainType={AnnotationDomainType.XDomain}
          dataValues={[{ dataValue: start.clone().add(metric, 'd').valueOf() }]}
          style={annotationStyle}
          hideTooltips
          marker={<EuiIcon type={iconMap[side]} />}
          markerBody={getMarkerBody((v) => moment(v).format('lll'), isVerticalSide)}
        />
      )}
      <HistogramBarSeries
        id="bars"
        xScaleType={ScaleType.Time}
        xAccessor="x"
        yAccessors={['y']}
        data={Array.from({ length: maxMetric })
          .fill(0)
          .map((_, i) => ({ x: start.clone().add(i, 'd').valueOf(), y: maxMetric }))}
      />
    </Chart>
  );
};

Example.parameters = {
  markdown: `The \`markerBody\` on the \`LineAnnotationSpec\` will be dynamically positioned to show content that would otherwise be hidden or overflow the chart.
    The \`marker\` prop (also on the \`LineAnnotationSpec\`) however, will always be positioned centered on the given \`dataValue\`.
    These can be used interchangeably to provide a content-rich annotation without losing the data reference.
    **Note: you will need to provide the necessary axis padding for the \`markerBody\` content as this is _not_ currently accounted for in the chart dimensioning**`,
};
