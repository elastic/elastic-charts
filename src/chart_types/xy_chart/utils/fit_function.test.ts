import { MockDataSeries } from '../../../mocks';
import { Fit } from './specs';
import { ScaleType } from '../../../utils/scales/scales';
import { DataSeriesDatum } from './series';

import * as testModule from './fit_function';

/**
 * Helper function to return array of rendered y1 values
 */
const getFilledNullData = (data: DataSeriesDatum[]): (number | undefined)[] => {
  return data.filter(({ y1 }) => y1 === null).map(({ filled }) => filled && filled.y1);
};

describe('Fit Function', () => {
  describe('parseConfig', () => {
    it('should return default type when none exists', () => {
      const actual = testModule.parseConfig();

      expect(actual).toEqual({
        type: Fit.None,
      });
    });

    it('should parse string config', () => {
      const actual = testModule.parseConfig(Fit.Average);

      expect(actual).toEqual({
        type: Fit.Average,
      });
    });

    it('should return default when Explicit is passes without value', () => {
      const actual = testModule.parseConfig({ type: Fit.Explicit });

      expect(actual).toEqual({
        type: Fit.None,
      });
    });

    it('should return type and value when Explicit is passes with value', () => {
      const actual = testModule.parseConfig({ type: Fit.Explicit, value: 20 });

      expect(actual).toEqual({
        type: Fit.Explicit,
        value: 20,
        endValue: undefined,
      });
    });

    it('should return type when no value or endValue is given', () => {
      const actual = testModule.parseConfig({ type: Fit.Average });

      expect(actual).toEqual({
        type: Fit.Average,
        value: undefined,
        endValue: undefined,
      });
    });

    it('should return type and endValue when endValue is passed', () => {
      const actual = testModule.parseConfig({ type: Fit.Average, endValue: 20 });

      expect(actual).toEqual({
        type: Fit.Average,
        value: undefined,
        endValue: 20,
      });
    });
  });

  describe('fitFunction', () => {
    const dataSeries = MockDataSeries.fitFunction();

    beforeAll(() => {
      jest.spyOn(testModule, 'parseConfig');
    });

    describe('allow mutliple fit config types', () => {
      it('should allow string config', () => {
        testModule.fitFunction(dataSeries, Fit.None, ScaleType.Linear);

        expect(testModule.parseConfig).toHaveBeenCalledWith(Fit.None);
        expect(testModule.parseConfig).toHaveBeenCalledTimes(1);
      });

      it('should allow object config', () => {
        const fitConfig = {
          type: Fit.None,
        };
        testModule.fitFunction(dataSeries, fitConfig, ScaleType.Linear);

        expect(testModule.parseConfig).toHaveBeenCalledWith(fitConfig);
        expect(testModule.parseConfig).toHaveBeenCalledTimes(1);
      });
    });

    describe('Fit Types', () => {
      describe('None', () => {
        it('should return original dataSeries', () => {
          const actual = testModule.fitFunction(dataSeries, Fit.None, ScaleType.Linear);

          expect(actual).toBe(dataSeries);
        });

        it('should return null data values without fit', () => {
          const actual = testModule.fitFunction(dataSeries, Fit.None, ScaleType.Linear);

          expect(getFilledNullData(actual.data)).toEqualArrayOf(undefined, 7);
        });
      });

      describe('Zero', () => {
        it('should NOT return original dataSeries', () => {
          const actual = testModule.fitFunction(dataSeries, Fit.Zero, ScaleType.Linear);

          expect(actual).not.toBe(dataSeries);
        });

        it('should return null data values with zeros', () => {
          const actual = testModule.fitFunction(dataSeries, Fit.Zero, ScaleType.Linear);
          const testActual = getFilledNullData(actual.data);

          expect(testActual).toEqualArrayOf(0, 7);
        });
      });

      describe('Explicit', () => {
        it('should return original dataSeries if no value provided', () => {
          const actual = testModule.fitFunction(dataSeries, { type: Fit.Explicit }, ScaleType.Linear);

          expect(actual).toBe(dataSeries);
        });

        it('should return null data values with set value', () => {
          const actual = testModule.fitFunction(dataSeries, { type: Fit.Explicit, value: 20 }, ScaleType.Linear);
          const testActual = getFilledNullData(actual.data);

          expect(testActual).toEqualArrayOf(20, 7);
        });
      });
    });
  });
});
