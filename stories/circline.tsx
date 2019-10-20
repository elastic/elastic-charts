import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';

import {
  Axis,
  BarSeries,
  Chart,
  getAxisId,
  //getGroupId,
  getSpecId,
  Position,
  ScaleType,
  SectorSeries,
  Settings,
} from '../src';
//import { KIBANA_METRICS } from '../src/utils/data_samples/test_dataset_kibana';

// prettier-ignore
const data = [
  { g: 'a', x: 'North', name: '7', /*min: 1110253391368, */value: 3110253391368 },
  { g: 'a', x: 'West', name: '3', min: 0, value: 1929578418424 },
  { g: 'a', x: 'South', name: '5', min: 0, value: 848173542536 },
  /*        { g: 'a', x: 3, name: '8', min: 0, value: 816837797016 },
      { g: 'a', x: 4, name: '6', min: 0, value: 745168037744 },
      { g: 'a', x: 5, name: '9', min: 0, value: 450507812880 },
      { g: 'a', x: 6, name: '2', min: 0, value: 393895581328 },
      { g: 'a', x: 7, name: '0', min: 0, value: 353335453296 },
      { g: 'a', x: 8, name: '1', min: 0, value: 54461075800 },
      { g: 'a', x: 9, name: '4', min: 0, value: 36006897720 },
*/

  { g: 'b', x: 'North', name: '7', min: 0, value: 1110253391368 },
  { g: 'b', x: 'West', name: '3', min: 0, value: 929578418424 },
  { g: 'b', x: 'South', name: '5', min: 0, value: 848173542536 },
  /*        { g: 'b', x: 3, name: '8', min: 0, value: 116837797016 },
       { g: 'b', x: 4, name: '6', min: 0, value: 45168037744 },
       { g: 'b', x: 5, name: '9', min: 0, value: 450507812880 },
       { g: 'b', x: 6, name: '2', min: 0, value: 93895581328 },
       { g: 'b', x: 7, name: '0', min: 0, value: 53335453296 },
       { g: 'b', x: 8, name: '1', min: 0, value: 54461075800 },
       { g: 'b', x: 9, name: '4', min: 0, value: 6006897720 },
 */

  { g: 'c', x: 'North', name: '7', min: 0, value: 510253391368 },
  { g: 'c', x: 'West', name: '3', min: 0, value: 529578418424 },
  { g: 'c', x: 'South', name: '5', min: 0, value: 448173542536 }
];

const data1 = [
  { r: 'Region', g: 'a', x: 'North', slice: 'North', name: '7', min: 0, value: 3110253391368 },
  { r: 'Region', g: 'a', x: 'West', slice: 'West', name: '3', min: 0, value: 1929578418424 },
  { r: 'Region', g: 'a', x: 'South', slice: 'South', name: '5', min: 0, value: 848173542536 },
  { r: 'Region', g: 'b', x: 'North', slice: 'North', name: '7', min: 0, value: 1110253391368 },
  { r: 'Region', g: 'b', x: 'West', slice: 'West', name: '3', min: 0, value: 929578418424 },
  { r: 'Region', g: 'b', x: 'South', slice: 'South', name: '5', min: 0, value: 848173542536 },
  { r: 'Region', g: 'c', x: 'North', slice: 'North', name: '7', min: 0, value: 510253391368 },
  { r: 'Region', g: 'c', x: 'West', slice: 'West', name: '3', min: 0, value: 529578418424 },
  { r: 'Region', g: 'c', x: 'South', slice: 'South', name: '5', min: 0, value: 448173542536 },
];

const data2 = [
  { r: 'City', g: 'd', x: 'North', slice: 'Oslo', name: '7', min: 0, value: 2110253391368 },
  { r: 'City', g: 'd', x: 'West', slice: 'Porto', name: '3', min: 0, value: 1729578418424 },
  { r: 'City', g: 'd', x: 'South', slice: 'Milano', name: '5', min: 0, value: 748173542536 },
  { r: 'City', g: 'e', x: 'North', slice: 'Oslo', name: '7', min: 0, value: 910253391368 },
  { r: 'City', g: 'e', x: 'West', slice: 'Porto', name: '3', min: 0, value: 729578418424 },
  { r: 'City', g: 'e', x: 'South', slice: 'Milano', name: '5', min: 0, value: 548173542536 },
  { r: 'City', g: 'f', x: 'North', slice: 'Oslo', name: '7', min: 0, value: 410253391368 },
  { r: 'City', g: 'f', x: 'West', slice: 'Porto', name: '3', min: 0, value: 500578418424 },
  { r: 'City', g: 'f', x: 'South', slice: 'Milano', name: '5', min: 0, value: 348173542536 },
];

storiesOf('Circline', module)
  .add('Circline', () => {
    const stackedAsPercentage = boolean('stacked as percentage', true);
    const clusterBars = boolean('cluster', false);

    const sectorSeries = (
      <SectorSeries
        id={getSpecId('sectors')}
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Polar}
        xAccessor="x"
        yAccessors={['value']}
        y0Accessors={['min']}
        /*
    y0AccessorFormat={'from'}
    y1AccessorFormat={'to'}
    */
        stackAccessors={clusterBars ? [] : ['x']}
        stackAsPercentage={clusterBars ? false : stackedAsPercentage}
        splitSeriesAccessors={['g']}
        sectorSeriesStyle={{ rect: { opacity: 1 } }}
        data={data}
      />
    );
    debugger;
    return (
      <Chart className={'story-chart'}>
        <Settings
          showLegend={true}
          legendPosition={Position.Right}
          theme={{ axes: { axisTitleStyle: { fontSize: 20 }, tickLabelStyle: { fontSize: 16 } } }}
        />
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Region'} showOverlappingTicks={true} />
        {/*
            <Axis
              id={getAxisId('left2')}
              title={'Part to whole ratio'}
              position={Position.Left}
              tickFormat={(d: any) => (stackedAsPercentage && !clusterBars ? `${Number(d * 100).toFixed(0)} %` : d)}
            />
            */}

        {sectorSeries}
      </Chart>
    );
  })
  .add('Multiring circline', () => {
    const stackedAsPercentage = boolean('stacked as percentage', true);
    const clusterBars = boolean('cluster', false);

    return (
      <Chart className={'story-chart'}>
        <Settings
          showLegend={true}
          legendPosition={Position.Right}
          theme={{ axes: { axisTitleStyle: { fontSize: 20 }, tickLabelStyle: { fontSize: 16 } } }}
        />
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Region'} showOverlappingTicks={true} />
        {/*
            <Axis
              id={getAxisId('left2')}
              title={'Part to whole ratio'}
              position={Position.Left}
              tickFormat={(d: any) => (stackedAsPercentage && !clusterBars ? `${Number(d * 100).toFixed(0)} %` : d)}
            />
            */}

        <SectorSeries
          id={getSpecId('sectrs')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Polar}
          xAccessor="x"
          yAccessors={['value']}
          y0Accessors={['min']}
          stackAccessors={['slice']}
          stackAsPercentage={clusterBars ? false : stackedAsPercentage}
          splitSeriesAccessors={['g']}
          sectorSeriesStyle={{ rect: { opacity: 0.4 } }}
          data={data1}
          groupId={'g1'}
        />
        <SectorSeries
          id={getSpecId('sectrs2')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Polar}
          xAccessor="x"
          yAccessors={['value']}
          y0Accessors={['min']}
          stackAccessors={['slice']}
          stackAsPercentage={clusterBars ? false : stackedAsPercentage}
          splitSeriesAccessors={['g']}
          sectorSeriesStyle={{ rect: { opacity: 0.4 } }}
          data={data2}
          groupId={'g2'}
        />
      </Chart>
    );
  })
  .add('Comparable stacked bar chart', () => {
    const stackedAsPercentage = boolean('stacked as percentage', true);
    const clusterBars = boolean('cluster', false);

    return (
      <Chart className={'story-chart'}>
        <Settings
          showLegend={true}
          legendPosition={Position.Right}
          theme={{ axes: { axisTitleStyle: { fontSize: 20 }, tickLabelStyle: { fontSize: 16 } } }}
        />
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Region'} showOverlappingTicks={true} />

        <Axis
          id={getAxisId('left2')}
          title={'Part to whole ratio'}
          position={Position.Left}
          tickFormat={(d: any) => (stackedAsPercentage && !clusterBars ? `${Number(d * 100).toFixed(0)} %` : d)}
        />

        <BarSeries
          id={getSpecId('bars00')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['value']}
          y0Accessors={['min']}
          stackAccessors={clusterBars ? [] : ['x']}
          stackAsPercentage={clusterBars ? false : stackedAsPercentage}
          splitSeriesAccessors={['g']}
          barSeriesStyle={{ rect: { opacity: 1 } }}
          data={data}
        />
      </Chart>
    );
  })
  .add('Dual stacked bar chart', () => {
    const stackedAsPercentage = boolean('stacked as percentage', true);
    const clusterBars = boolean('cluster', false);

    return (
      <Chart className={'story-chart'}>
        <Settings
          showLegend={true}
          legendPosition={Position.Right}
          theme={{ axes: { axisTitleStyle: { fontSize: 20 }, tickLabelStyle: { fontSize: 16 } } }}
        />
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Region'} showOverlappingTicks={true} />

        {/*
        <Axis
          id={getAxisId('left2')}
          title={'Part to whole ratio'}
          position={Position.Left}
          tickFormat={(d: any) => (stackedAsPercentage && !clusterBars ? `${Number(d * 100).toFixed(0)} %` : d)}
        />
*/}

        <BarSeries
          id={getSpecId('sectrs')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['value']}
          y0Accessors={['min']}
          stackAccessors={['slice']}
          stackAsPercentage={clusterBars ? false : stackedAsPercentage}
          splitSeriesAccessors={['g']}
          barSeriesStyle={{ rect: { opacity: 1 } }}
          data={data1}
          groupId={'g1'}
        />

        <BarSeries
          id={getSpecId('sectors2')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['value']}
          y0Accessors={['min']}
          stackAccessors={['slice']}
          stackAsPercentage={clusterBars ? false : stackedAsPercentage}
          splitSeriesAccessors={['g']}
          barSeriesStyle={{ rect: { opacity: 1 } }}
          data={data2}
          groupId={'g2'}
        />
      </Chart>
    );
  });
