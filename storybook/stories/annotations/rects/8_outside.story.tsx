/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { boolean, number, select } from '@storybook/addon-knobs';
import React from 'react';

import { Axis, Chart, LineSeries, Position, ScaleType, RectAnnotation, Settings } from '@elastic/charts';

import { ChartsStory } from '../../../types';
import { useBaseTheme } from '../../../use_base_theme';
import { customKnobs } from '../../utils/knobs';

const vGroups = {
  Primary: 'primary',
  Secondary: 'secondary',
};

export const Example: ChartsStory = (_, { title, description }) => {
  const useGroupIds = boolean('use groupIds', true, 'Annotations');
  const debug = boolean('debug', false);
  const rotation = customKnobs.enum.rotation();
  const tickSize = number('Tick size', 10, { min: 0, max: 20, step: 1 });
  const hideAxes = boolean('Hide all axes', false);

  const domainAxis = select(
    'Domain axis',
    {
      'X axis': 'x',
      'Y axis': 'y',
    },
    'x',
    'Annotations',
  );
  const isX = domainAxis === 'x';
  const isVert = isX ? rotation === 0 || rotation === 180 : rotation === 90 || rotation === -90;
  const outside = boolean('Render outside chart', true, 'Annotations');
  const outsideDimension = number('Outside dimension', 5, { min: 0, step: 1 }, 'Annotations');
  const redGroupId = select('Red groupId', vGroups, vGroups.Primary, 'Annotations');
  const blueGroupId = select('Blue groupId', vGroups, vGroups.Secondary, 'Annotations');

  return (
    <Chart title={title} description={description}>
      <Settings
        debug={debug}
        rotation={rotation}
        theme={{ axes: { tickLine: { size: tickSize } } }}
        baseTheme={useBaseTheme()}
      />

      {useGroupIds && (
        <>
          <Axis
            id="left"
            hide={hideAxes}
            groupId={isVert ? undefined : vGroups.Primary}
            position={Position.Left}
            title={isVert ? 'Left' : 'Primary - Left'}
          />
          {!isVert && (
            <Axis
              id="right"
              hide={hideAxes}
              groupId={vGroups.Secondary}
              position={Position.Right}
              title="Secondary - Right"
            />
          )}
          <Axis
            id="bottom"
            hide={hideAxes}
            groupId={isVert ? vGroups.Primary : undefined}
            position={Position.Bottom}
            title={isVert ? 'Primary - Bottom' : 'Bottom'}
          />
          {isVert && (
            <Axis
              id="top"
              hide={hideAxes}
              groupId={vGroups.Secondary}
              position={Position.Top}
              title="Secondary - Top"
            />
          )}
        </>
      )}

      {!useGroupIds && (
        <>
          <Axis id="left" hide={hideAxes} position={Position.Left} title="Left" />
          <Axis id="bottom" hide={hideAxes} position={Position.Bottom} title="Bottom" />
        </>
      )}

      <RectAnnotation
        groupId={useGroupIds ? redGroupId : undefined}
        dataValues={[
          {
            coordinates: isX
              ? {
                  x0: 2,
                  x1: 4,
                }
              : {
                  y0: 1,
                  y1: 2,
                },
            details: 'Red - One',
          },
          {
            coordinates: isX
              ? {
                  x0: 7,
                  x1: 10,
                }
              : {
                  y0: 5,
                  y1: 7,
                },
            details: 'Red - Two',
          },
        ]}
        id="red"
        style={{ fill: '#b62b39' }}
        outside={outside}
        outsideDimension={outsideDimension}
      />
      <RectAnnotation
        groupId={useGroupIds ? blueGroupId : undefined}
        dataValues={[
          {
            coordinates: isX
              ? {
                  x0: 5,
                  x1: 6,
                }
              : {
                  y0: 3,
                  y1: 4,
                },
            details: 'Blue - One',
          },
          {
            coordinates: isX
              ? {
                  x0: 17,
                  x1: 30,
                }
              : {
                  y0: 8,
                  y1: 20,
                },
            details: 'Blue - Two',
          },
        ]}
        id="blue"
        style={{ fill: '#2b5fb6' }}
        outside={outside}
        outsideDimension={outsideDimension}
      />

      <LineSeries
        id="lines1"
        groupId={useGroupIds && !isX ? vGroups.Primary : undefined}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 7 },
          { x: 13, y: 10 },
          { x: 20, y: 6 },
        ]}
      />
      <LineSeries
        id="lines2"
        groupId={useGroupIds && !isX ? vGroups.Secondary : undefined}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 2 },
          { x: 1, y: 5 },
          { x: 13, y: 7 },
          { x: 20, y: 10 },
        ]}
      />
    </Chart>
  );
};
