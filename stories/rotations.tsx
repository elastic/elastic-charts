import { boolean, select } from '@storybook/addon-knobs';
import React from 'react';
import { Axis, BarSeries, Chart, getAxisId, getSpecId, Position, ScaleType, Settings } from '../src/';

export default {
  title: 'Rotations',
  parameters: {
    info: {
      source: false,
    },
  },
};

export const withOrdinalAxis = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings
        debug={boolean('Debug', true)}
        showLegend={boolean('Legend', true)}
        showLegendExtra
        legendPosition={select(
          'Legend position',
          {
            Left: Position.Left,
            Right: Position.Right,
            Top: Position.Top,
            Bottom: Position.Bottom,
          },
          Position.Right,
        )}
        rotation={select(
          'Rotation degree',
          {
            '0 deg(default)': 0,
            '90 deg': 90,
            '-90 deg': -90,
            '180 deg': 180,
          },
          0,
        )}
      />
      <Axis
        id={getAxisId('bottom')}
        position={Position.Bottom}
        title={'Bottom axis'}
        showOverlappingTicks={true}
        showOverlappingLabels={boolean('bottom show overlapping labels', false)}
      />
      <Axis
        id={getAxisId('left2')}
        title={'Left axis'}
        position={Position.Left}
        showOverlappingTicks={true}
        showOverlappingLabels={boolean('left show overlapping labels', false)}
      />

      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 1 },
          { x: 'b', y: 2 },
          { x: 'c', y: 3 },
          { x: 'd', y: 4 },
        ]}
      />
    </Chart>
  );
};
withOrdinalAxis.story = {
  name: 'with ordinal axis',
};

export const negative90DegreeOrdinal = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={-90} />
      <Axis id={getAxisId('y top')} position={Position.Top} title={'y top axis'} />
      <Axis id={getAxisId('x right')} title={'x right axis'} position={Position.Right} />
      <Axis id={getAxisId('y bottom')} position={Position.Bottom} title={'y bottom axis'} />
      <Axis id={getAxisId('x left')} title={'x left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 1 },
          { x: 'b', y: 2 },
          { x: 'c', y: 3 },
          { x: 'd', y: 4 },
        ]}
      />
    </Chart>
  );
};
negative90DegreeOrdinal.story = {
  name: 'negative 90 deg ordinal',
};

export const rotations0DegOrdinal = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={0} />
      <Axis id={getAxisId('x top')} position={Position.Top} title={'x top axis'} />
      <Axis id={getAxisId('y right')} title={'y right axis'} position={Position.Right} />
      <Axis id={getAxisId('x bottom')} position={Position.Bottom} title={'x bottom axis'} />
      <Axis id={getAxisId('y left')} title={'y left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 1 },
          { x: 'b', y: 2 },
          { x: 'c', y: 3 },
          { x: 'd', y: 4 },
        ]}
      />
    </Chart>
  );
};
rotations0DegOrdinal.story = {
  name: '0 deg ordinal',
};

export const rotations90DegOrdinal = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={90} />
      <Axis id={getAxisId('y top')} position={Position.Top} title={'y top axis'} />
      <Axis id={getAxisId('x right')} title={'x right axis'} position={Position.Right} />
      <Axis id={getAxisId('y bottom')} position={Position.Bottom} title={'y bottom axis'} />
      <Axis id={getAxisId('x left')} title={'x left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 1 },
          { x: 'b', y: 2 },
          { x: 'c', y: 3 },
          { x: 'd', y: 4 },
        ]}
      />
    </Chart>
  );
};
rotations90DegOrdinal.story = {
  name: '90 deg ordinal',
};

export const rotations180DegOrdinal = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={180} />
      <Axis id={getAxisId('x top')} position={Position.Top} title={'x top axis'} />
      <Axis id={getAxisId('y right')} title={'y right axis'} position={Position.Right} />
      <Axis id={getAxisId('x bottom')} position={Position.Bottom} title={'x bottom axis'} />
      <Axis id={getAxisId('y left')} title={'y left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 1 },
          { x: 'b', y: 2 },
          { x: 'c', y: 3 },
          { x: 'd', y: 4 },
        ]}
      />
    </Chart>
  );
};
rotations180DegOrdinal.story = {
  name: '180 deg ordinal',
};

export const negative90DegLinear = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={-90} />
      <Axis id={getAxisId('y top')} position={Position.Top} title={'y top axis'} />
      <Axis id={getAxisId('x right')} title={'x right axis'} position={Position.Right} />
      <Axis id={getAxisId('y bottom')} position={Position.Bottom} title={'y bottom axis'} />
      <Axis id={getAxisId('x left')} title={'x left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ]}
      />
    </Chart>
  );
};
negative90DegLinear.story = {
  name: 'negative 90 deg linear',
};

export const rotations0DegLinear = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={0} />
      <Axis id={getAxisId('x top')} position={Position.Top} title={'x top axis'} />
      <Axis id={getAxisId('y right')} title={'y right axis'} position={Position.Right} />
      <Axis id={getAxisId('x bottom')} position={Position.Bottom} title={'x bottom axis'} />
      <Axis id={getAxisId('y left')} title={'y left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ]}
      />
    </Chart>
  );
};
rotations0DegLinear.story = {
  name: '0 deg linear',
};

export const rotations90DegLinear = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={90} />
      <Axis id={getAxisId('y top')} position={Position.Top} title={'y top axis'} />
      <Axis id={getAxisId('x right')} title={'x right axis'} position={Position.Right} />
      <Axis id={getAxisId('y bottom')} position={Position.Bottom} title={'y bottom axis'} />
      <Axis id={getAxisId('x left')} title={'x left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ]}
      />
    </Chart>
  );
};
rotations90DegLinear.story = {
  name: '90 deg linear',
};

export const rotations180DegLinear = () => {
  return (
    <Chart className={'story-chart'}>
      <Settings showLegend showLegendExtra legendPosition={Position.Right} rotation={180} />
      <Axis id={getAxisId('x top')} position={Position.Top} title={'x top axis'} />
      <Axis id={getAxisId('y right')} title={'y right axis'} position={Position.Right} />
      <Axis id={getAxisId('x bottom')} position={Position.Bottom} title={'x bottom axis'} />
      <Axis id={getAxisId('y left')} title={'y left axis'} position={Position.Left} />
      <BarSeries
        id={getSpecId('bars')}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ]}
      />
    </Chart>
  );
};
rotations180DegLinear.story = {
  name: '180 deg linear',
};
