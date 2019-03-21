import { computeSeriesDomains } from '../../state/utils';
import { getGroupId, getSpecId } from '../utils/ids';
import { ScaleType } from '../utils/scales/scales';
import { renderBars } from './rendering';
import { computeXScale, computeYScales } from './scales';
import { BarSeriesSpec } from './specs';
const SPEC_ID = getSpecId('spec_1');
const GROUP_ID = getGroupId('group_1');

describe('Rendering', () => {
  describe('Single series barchart - ordinal', () => {
    const barSeriesSpec: BarSeriesSpec = {
      id: SPEC_ID,
      groupId: GROUP_ID,
      seriesType: 'bar',
      yScaleToDataExtent: false,
      data: [[0, 10], [1, 5]],
      xAccessor: 0,
      yAccessors: [1],
      xScaleType: ScaleType.Ordinal,
      yScaleType: ScaleType.Linear,
    };
    const barSeriesMap = new Map();
    barSeriesMap.set(SPEC_ID, barSeriesSpec);
    const barSeriesDomains = computeSeriesDomains(barSeriesMap);
    const xScale = computeXScale(barSeriesDomains.xDomain, barSeriesMap.size, 0, 100);
    const yScales = computeYScales(barSeriesDomains.yDomain, 100, 0);

    test('Can render two bars bar', () => {
      const { barGeometries } = renderBars(
        0,
        barSeriesDomains.formattedDataSeries.nonStacked[0].dataSeries[0].data,
        xScale,
        yScales.get(GROUP_ID)!,
        'red',
        SPEC_ID,
        [],
      );
      expect(barGeometries[0]).toEqual({
        x: 0,
        y: 0,
        width: 50,
        height: 100,
        color: 'red',
        value: {
          specId: SPEC_ID,
          seriesKey: [],
          datum: [0, 10],
        },
        geometryId: {
          specId: SPEC_ID,
          seriesKey: [],
        },
      });
      expect(barGeometries[1]).toEqual({
        x: 50,
        y: 50,
        width: 50,
        height: 50,
        color: 'red',
        value: {
          specId: SPEC_ID,
          seriesKey: [],
          datum: [1, 5],
        },
        geometryId: {
          specId: SPEC_ID,
          seriesKey: [],
        },
      });
    });
  });
});
