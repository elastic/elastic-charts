import * as testModule from './zero_axis_utils';
import { YDomain } from '../domains/y_domain';
import { ScaleType } from '../../../utils/scales/scales';
import { DEFAULT_GLOBAL_ID } from '../utils/specs';
import { getGroupId } from '../../../utils/ids';
import { computeYScales } from './scales';

const chartDim = {
  width: 100,
  height: 100,
  top: 0,
  left: 0,
};

describe('ZeroAxis Utils', () => {
  describe('Get ZeroAxes', () => {
    test('no domain', () => {
      const input = computeYScales({ yDomains: [], range: [100, 0] });
      const output = testModule.computeZeroAxes(input, chartDim, 0);
      expect(output).toMatchObject([]);
    });
    test('two yDomains - log and with positive values only', () => {
      const yDomains: YDomain[] = [
        {
          type: 'yDomain',
          groupId: getGroupId(DEFAULT_GLOBAL_ID),
          domain: [-10, 10],
          scaleType: ScaleType.Log,
          isBandScale: false,
        },
        {
          type: 'yDomain',
          groupId: getGroupId('Group2'),
          domain: [2, 12],
          scaleType: ScaleType.Linear,
          isBandScale: false,
        },
      ];

      const input = computeYScales({ yDomains, range: [100, 0] });
      const output = testModule.computeZeroAxes(input, chartDim, 0);
      expect(output).toMatchObject([]);
    });

    test('two yDomains with positive and negative values, chartRotation 180deg', () => {
      const yDomains: YDomain[] = [
        {
          type: 'yDomain',
          groupId: getGroupId(DEFAULT_GLOBAL_ID),
          domain: [-5, 15],
          scaleType: ScaleType.Linear,
          isBandScale: false,
        },
        {
          type: 'yDomain',
          groupId: getGroupId('Group2'),
          domain: [-1500, 500],
          scaleType: ScaleType.Linear,
          isBandScale: false,
        },
      ];

      const input = computeYScales({ yDomains, range: [100, 0] });
      const output = testModule.computeZeroAxes(input, chartDim, 180);
      const expected = [
        {
          groupId: getGroupId(DEFAULT_GLOBAL_ID),
          points: [0, 25, 100, 25],
        },
        {
          groupId: 'Group2',
          points: [0, 75, 100, 75],
        },
      ];
      expect(output).toMatchObject(expected);
    });

    test('two yDomains - with positive and negative values and with negative and 0, chartRotation 90deg', () => {
      const yDomains: YDomain[] = [
        {
          type: 'yDomain',
          groupId: getGroupId(DEFAULT_GLOBAL_ID),
          domain: [-10, 0],
          scaleType: ScaleType.Linear,
          isBandScale: false,
        },
        {
          type: 'yDomain',
          groupId: getGroupId('Group2'),
          domain: [-30, 10],
          scaleType: ScaleType.Linear,
          isBandScale: false,
        },
      ];
      const input = computeYScales({ yDomains, range: [100, 0] });
      const output = testModule.computeZeroAxes(input, chartDim, 0);
      const expected = [
        {
          groupId: 'Group2',
          points: [0, 25, 100, 25],
        },
      ];
      expect(output).toMatchObject(expected);
    });
  });
});
