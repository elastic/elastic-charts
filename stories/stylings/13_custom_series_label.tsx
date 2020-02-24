import React from 'react';

import { Axis, BarSeries, Chart, Position, ScaleType, Settings } from '../../src';
import * as TestDatasets from '../../src/utils/data_samples/test_dataset';
import { SeriesStringPredicate, SubSeriesStringPredicate } from '../../src/chart_types/xy_chart/utils/specs';

export const example = () => {
  const customSeriesLabel: SeriesStringPredicate = ({ yAccessor, splitAccessors }) => {
    // eslint-disable-next-line react/prop-types
    if (yAccessor === 'y1' && splitAccessors.get('g') === 'a') {
      return 'replace full series name';
    }

    return null;
  };
  const customSubSeriesLabel: SubSeriesStringPredicate = (accessor, key) => {
    if (key) {
      // split accessor;
      if (accessor === 'a') {
        return 'replace a(from g)';
      }
    } else {
      // y accessor;
      if (accessor === 'y2') {
        return 'replace y2';
      }
    }

    return null;
  };
  return (
    <Chart className="story-chart">
      <Settings showLegend showLegendExtra legendPosition={Position.Right} />
      <Axis id="bottom" position={Position.Bottom} title="Bottom axis" showOverlappingTicks={true} />
      <Axis id="left2" title="Left axis" position={Position.Left} tickFormat={(d: any) => Number(d).toFixed(2)} />

      <BarSeries
        id="bars1"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y1', 'y2']}
        splitSeriesAccessors={['g']}
        data={TestDatasets.BARCHART_2Y1G}
        customSeriesLabel={customSeriesLabel}
        customSubSeriesLabel={customSubSeriesLabel}
      />
    </Chart>
  );
};
