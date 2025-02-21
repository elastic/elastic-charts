/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { action } from '@storybook/addon-actions';
import { boolean, number } from '@storybook/addon-knobs';
import type { CSSProperties } from 'react';
import React, { useState } from 'react';

import { Axis, Chart, Position, ScaleType, Settings } from '@elastic/charts';

import { BarSeries } from '../../../packages/charts/src/chart_types/specs';
import type { ChartsStory } from '../../types';
import { useBaseTheme } from '../../use_base_theme';

interface Dimensions {
  height: number;
  left: number;
  top: number;
  width: number;
}

const Measurement = (props: { text: string; horizontal: boolean; dims: CSSProperties }) => {
  return (
    <div style={{ position: 'absolute', ...props.dims, zIndex: 2000 }}>
      <div
        style={{
          position: 'relative',
          ...(props.horizontal ? { width: '100%', height: 10 } : { width: 10, height: '100%' }),
        }}
      >
        <div
          style={{
            position: 'absolute',
            ...(props.horizontal
              ? { width: '100%', height: 10, borderLeft: '1px solid black', borderRight: '1px solid black' }
              : {
                  width: 10,
                  height: '100%',
                  borderTop: '1px solid black',
                  borderBottom: '1px solid black',
                }),
          }}
        />
        <div
          style={{
            position: 'absolute',
            ...(props.horizontal
              ? { top: '50%', width: '100%', height: 20, borderTop: '1px solid black' }
              : { left: '50%', width: 20, height: '100%', borderLeft: '1px solid black' }),
          }}
        />
        <div
          style={{
            position: 'absolute',

            color: 'black',
            fontSize: 10,
            width: '100%',
            textAlign: 'center',
            verticalAlign: 'middle',
            ...(props.horizontal
              ? {
                  top: 8,
                }
              : {
                  height: '100%',
                  left: 10,
                  writingMode: 'vertical-lr',
                }),
          }}
        >
          {props.text}
        </div>
      </div>
    </div>
  );
};

const HTML_CHART_PADDING = 20;

export const Example: ChartsStory = (_, { title, description }) => {
  const legendEnabled = boolean('show legend', true);
  const axisYEnabled = boolean('show y axis', true);
  const axisXEnabled = boolean('show x axis', true);

  const padding = number('chart paddings', 50, { min: 0, max: 100, range: true, step: 1 });

  const [dimensions, setDimensions] = useState<{ projection: Dimensions; parent: Dimensions } | null>(null);
  const onAreaChangeAction = action('onProjectionAreaChange');
  const onAreaChangeHandler = (areas: { projection: Dimensions; parent: Dimensions }) => {
    onAreaChangeAction(areas);
    setDimensions(areas);
  };

  return (
    <>
      {dimensions && (
        <>
          <Measurement
            dims={{
              top: HTML_CHART_PADDING,
              left: HTML_CHART_PADDING + dimensions.projection.left,
              width: dimensions.projection.width,
              height: 20,
            }}
            horizontal={true}
            text={`projection left: ${dimensions.projection.left} width: ${dimensions.projection.width}`}
          />

          <Measurement
            dims={{
              top: HTML_CHART_PADDING + dimensions.projection.top,
              left: HTML_CHART_PADDING + 20 + dimensions.projection.left + dimensions.projection.width,
              width: 20,
              height: dimensions.projection.height,
            }}
            horizontal={false}
            text={`projection top: ${dimensions.projection.top} height: ${dimensions.projection.height}`}
          />
        </>
      )}

      {dimensions && (
        <>
          <Measurement
            dims={{
              top: HTML_CHART_PADDING,
              left: HTML_CHART_PADDING + 10,
              width: 20,
              height: dimensions.parent.height,
            }}
            horizontal={false}
            text={`parent height: ${dimensions.parent.height}`}
          />

          <Measurement
            dims={{
              bottom: 20,
              left: HTML_CHART_PADDING,
              width: dimensions.parent.width,
              height: HTML_CHART_PADDING,
            }}
            horizontal={true}
            text={`parent width: ${dimensions.parent.width}`}
          />
        </>
      )}
      <Chart title={title} description={description}>
        <Settings
          showLegend={legendEnabled}
          baseTheme={useBaseTheme()}
          theme={[
            {
              background: {
                color: 'transparent',
              },
              chartMargins: {
                top: padding,
                bottom: padding,
                left: padding,
                right: padding,
              },
            },
          ]}
          onProjectionAreaChange={onAreaChangeHandler}
        />
        {axisXEnabled && (
          <Axis
            id="bottom"
            position={Position.Bottom}
            style={{ tickLine: { visible: false }, tickLabel: { padding: 5 } }}
          />
        )}
        {axisYEnabled && <Axis id="quantity" position={Position.Left} ticks={5} />}
        <BarSeries
          id="data"
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={[
            ['apples', 10],
            ['oranges', 3],
            ['bananas', 5],
          ]}
        />
      </Chart>
    </>
  );
};
