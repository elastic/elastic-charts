import { ScaleType } from '../../../scales';
import { XDomain } from '../domains/x_domain';
import { computeXScale, countBarsInCluster } from './scales';
import { FormattedDataSeries } from './series';

describe('Series scales', () => {
  const xDomainLinear: XDomain = {
    type: 'xDomain',
    isBandScale: true,
    domain: [0, 3],
    minInterval: 1,
    scaleType: ScaleType.Linear,
  };

  const xDomainOrdinal: XDomain = {
    type: 'xDomain',
    isBandScale: true,
    domain: ['a', 'b'],
    minInterval: 1,
    scaleType: ScaleType.Ordinal,
  };

  test('should compute X Scale linear min, max with bands', () => {
    const scale = computeXScale({ xDomain: xDomainLinear, totalBarsInCluster: 1, range: [0, 120] });
    const expectedBandwidth = 120 / 4;
    expect(scale.bandwidth).toBe(120 / 4);
    expect(scale.scale(0)).toBe(0);
    expect(scale.scale(1)).toBe(expectedBandwidth * 1);
    expect(scale.scale(2)).toBe(expectedBandwidth * 2);
    expect(scale.scale(3)).toBe(expectedBandwidth * 3);
  });

  test('should compute X Scale linear inverse min, max with bands', () => {
    const scale = computeXScale({ xDomain: xDomainLinear, totalBarsInCluster: 1, range: [120, 0] });
    const expectedBandwidth = 120 / 4;
    expect(scale.bandwidth).toBe(expectedBandwidth);
    expect(scale.scale(0)).toBe(expectedBandwidth * 3);
    expect(scale.scale(1)).toBe(expectedBandwidth * 2);
    expect(scale.scale(2)).toBe(expectedBandwidth * 1);
    expect(scale.scale(3)).toBe(expectedBandwidth * 0);
  });

  describe('computeXScale with single value domain', () => {
    const maxRange = 120;
    const singleDomainValue = 3;
    const minInterval = 1;

    test('should return extended domain & range when in histogram mode', () => {
      const xDomainSingleValue: XDomain = {
        type: 'xDomain',
        isBandScale: true,
        domain: [singleDomainValue, singleDomainValue],
        minInterval: minInterval,
        scaleType: ScaleType.Linear,
      };
      const enableHistogramMode = true;

      const scale = computeXScale({
        xDomain: xDomainSingleValue,
        totalBarsInCluster: 1,
        range: [0, maxRange],
        barsPadding: 0,
        enableHistogramMode,
      });
      expect(scale.bandwidth).toBe(maxRange);
      expect(scale.domain).toEqual([singleDomainValue, singleDomainValue + minInterval]);
      // reducing of 1 pixel the range for band scale
      expect(scale.range).toEqual([0, maxRange]);
    });

    test('should return unextended domain & range when not in histogram mode', () => {
      const xDomainSingleValue: XDomain = {
        type: 'xDomain',
        isBandScale: true,
        domain: [singleDomainValue, singleDomainValue],
        minInterval: minInterval,
        scaleType: ScaleType.Linear,
      };
      const enableHistogramMode = false;

      const scale = computeXScale({
        xDomain: xDomainSingleValue,
        totalBarsInCluster: 1,
        range: [0, maxRange],
        barsPadding: 0,
        enableHistogramMode,
      });
      expect(scale.bandwidth).toBe(maxRange);
      expect(scale.domain).toEqual([singleDomainValue, singleDomainValue]);
      expect(scale.range).toEqual([0, 0]);
    });
  });

  test('should compute X Scale ordinal', () => {
    const nonZeroGroupScale = computeXScale({ xDomain: xDomainOrdinal, totalBarsInCluster: 1, range: [120, 0] });
    const expectedBandwidth = 60;
    expect(nonZeroGroupScale.bandwidth).toBe(expectedBandwidth);
    expect(nonZeroGroupScale.scale('a')).toBe(expectedBandwidth);
    expect(nonZeroGroupScale.scale('b')).toBe(0);

    const zeroGroupScale = computeXScale({ xDomain: xDomainOrdinal, totalBarsInCluster: 0, range: [120, 0] });
    expect(zeroGroupScale.bandwidth).toBe(expectedBandwidth);
  });

  test('count bars required on a cluster', () => {
    const stacked: FormattedDataSeries[] = [
      {
        groupId: 'g1',
        dataSeries: [],
        counts: {
          areaSeries: 10,
          barSeries: 2,
          lineSeries: 2,
        },
      },
      {
        groupId: 'g2',
        dataSeries: [],
        counts: {
          areaSeries: 10,
          barSeries: 20,
          lineSeries: 2,
        },
      },
      {
        groupId: 'g3',
        dataSeries: [],
        counts: {
          areaSeries: 10,
          barSeries: 0,
          lineSeries: 2,
        },
      },
    ];
    const nonStacked: FormattedDataSeries[] = [
      {
        groupId: 'g1',
        dataSeries: [],
        counts: {
          areaSeries: 10,
          barSeries: 5,
          lineSeries: 2,
        },
      },
      {
        groupId: 'g2',
        dataSeries: [],
        counts: {
          areaSeries: 10,
          barSeries: 7,
          lineSeries: 2,
        },
      },
    ];
    const { nonStackedBarsInCluster, stackedBarsInCluster, totalBarsInCluster } = countBarsInCluster(
      stacked,
      nonStacked,
    );
    expect(nonStackedBarsInCluster).toBe(12);
    // count one per group
    expect(stackedBarsInCluster).toBe(2);
    expect(totalBarsInCluster).toBe(14);
  });
  describe('bandwidth when totalBarsInCluster is greater than 0 or less than 0', () => {
    const xDomainLinear: XDomain = {
      type: 'xDomain',
      isBandScale: true,
      domain: [0, 3],
      minInterval: 1,
      scaleType: ScaleType.Linear,
    };
    const maxRange = 120;
    const scaleOver0 = computeXScale({
      xDomain: xDomainLinear,
      totalBarsInCluster: 2,
      range: [0, maxRange],
      barsPadding: 0,
      enableHistogramMode: false,
    });

    test('totalBarsInCluster greater than 0', () => {
      expect(scaleOver0.bandwidth).toBe(maxRange / 4 / 2);
    });

    const scaleUnder0 = computeXScale({
      xDomain: xDomainLinear,
      totalBarsInCluster: 0,
      range: [0, maxRange],
      barsPadding: 0,
      enableHistogramMode: false,
    });
    test('totalBarsInCluster less than 0', () => {
      expect(scaleUnder0.bandwidth).toBe(maxRange / 4);
    });
  });
});
