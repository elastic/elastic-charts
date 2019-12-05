import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { Chart, getSpecId, Sunburst } from '../src';
import { mocks } from '../src/chart_types/hierarchical_chart/layout/mocks/mocks';

storiesOf('Sunburst', module).add('Sunburst with fill labels', () => {
  const darkmode = boolean('darkmode', false);
  const className = darkmode ? 'story-chart-dark' : 'story-chart';
  //const toggleSpec = boolean('toggle bar spec', true);
  //const data1 = [{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }];
  //const data2 = data1.map((datum) => ({ ...datum, y: datum.y - 1 }));
  //const data = toggleSpec ? data1 : data2;
  const specId = 'sunburst1'; //toggleSpec ? 'bars1' : 'bars2';

  return (
    <Chart className={className}>
      <Sunburst id={getSpecId(specId)} donut={false} data={mocks.miniSunburst} />
    </Chart>

    /*
    <Chart className={className}>
      <BarSeries
        id={getSpecId(specId)}
        name={'Simple bar series'}
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
*/
  );
});
