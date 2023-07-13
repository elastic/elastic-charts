/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';

import {
  Axis,
  LineSeries,
  Chart,
  RectAnnotation,
  ScaleType,
  Settings,
  Position,
  AnnotationDomainType,
  LineAnnotation,
  BarSeries,
} from '@elastic/charts';
import { Icon } from '@elastic/charts/src/components/icons/icon';

import { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { getDebugStateLogger } from '../../utils/debug_state_logger';

export const Example: ChartsStory = (_, { title, description }) => {
  const onAnnotationClick = boolean('onAnnotationClick listener', true);
  const onElementClick = boolean('onElementClick listener', true);
  const typeOfSeries = select('series type', ['line', 'bar'], 'bar');
  const debugState = boolean('Enable debug state', false);

  return (
    <Chart title={title} description={description}>
      <Settings
        onRenderChange={getDebugStateLogger(debugState)}
        debugState={debugState}
        baseTheme={useBaseTheme()}
        onAnnotationClick={onAnnotationClick ? action('onAnnotationClick') : undefined}
        onElementClick={onElementClick ? action('onElementClick') : undefined}
      />
      <RectAnnotation
        id="rect1"
        dataValues={[
          {
            coordinates: {
              x0: 0,
              x1: 1,
              y0: 0,
              y1: 4,
            },
            details: 'details about this annotation',
          },
        ]}
        style={{ fill: 'red' }}
      />
      <RectAnnotation
        id="rect2"
        dataValues={[
          {
            coordinates: {
              x0: 0.8,
              x1: 2,
              y0: 1,
              y1: 5,
            },
            details: 'details about this other annotation',
          },
        ]}
        style={{ fill: 'blue' }}
      />
      <LineAnnotation
        id="line_annotation"
        domainType={AnnotationDomainType.XDomain}
        dataValues={[{ dataValue: 2, details: `detail-${0}` }]}
        marker={<Icon type="alert" />}
        markerPosition={Position.Top}
      />
      <Axis id="bottom" position={Position.Bottom} title="x-domain axis" />
      <Axis id="left" title="y-domain axis" position={Position.Left} />
      {typeOfSeries === 'line' ? (
        <LineSeries
          id="lines"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 2 },
            { x: 1, y: 3 },
            { x: 1.5, y: 4 },
            { x: 3, y: 6 },
          ]}
        />
      ) : (
        <BarSeries
          id="lines"
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 0, y: 2 },
            { x: 1, y: 3 },
            { x: 1.5, y: 4 },
            { x: 3, y: 6 },
          ]}
        />
      )}
    </Chart>
  );
};
