import React, { Fragment } from 'react';
import { Chart, getSpecId, SectorSeries, Settings, Position, Axis, getAxisId, ScaleType } from '../src';

export class Playground extends React.Component {
  render() {
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

    const stackedAsPercentage = true;
    const clusterBars = false;

    return (
      <Fragment>
        <div className="chart">
          <Chart className={'story-chart'}>
            <Settings
              showLegend={true}
              legendPosition={Position.Right}
              theme={{ axes: { axisTitleStyle: { fontSize: 20 }, tickLabelStyle: { fontSize: 16 } } }}
            />
            <Axis id={getAxisId('bottom')} position={Position.Top} title={'Region'} showOverlappingTicks={true} />
            {/*
            <Axis
              id={getAxisId('left2')}
              title={'Part to whole ratio'}
              position={Position.Left}
              tickFormat={(d: any) => (stackedAsPercentage && !clusterBars ? `${Number(d * 100).toFixed(0)} %` : d)}
            />
            */}

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
          </Chart>
        </div>
      </Fragment>
    );
  }
}
