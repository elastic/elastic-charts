import { MockDataSeries } from '../../../mocks';
import { Fit } from './specs';
import { ScaleType } from '../../../utils/scales/scales';

jest.unmock('./fit_function');
import * as testModule from './fit_function';

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
    beforeAll(() => {
      testModule.parseConfig = jest.fn();
      // jest.spyOn(testModule, 'parseConfig').mockReturnValue({
      //   type: 'zero',
      // });
    });

    describe('Config types', () => {
      const dataSeries = MockDataSeries.fitFunction();
      it('should allow string config', () => {
        testModule.fitFunction(dataSeries, Fit.None, ScaleType.Linear);

        expect(testModule.parseConfig).toHaveBeenCalledWith(Fit.None);
      });

      // it('should allow object config', () => {
      //   const fitConfig = {
      //     type: Fit.None,
      //   };
      //   testModule.fitFunction(dataSeries, fitConfig, ScaleType.Linear);

      //   expect(testModule.parseConfig).toHaveBeenCalledWith(fitConfig);
      // });
    });

    describe('Config types', () => {
      const dataSeries = MockDataSeries.fitFunction();
      it('should allow string config', () => {
        const actual = testModule.fitFunction(dataSeries, Fit.None, ScaleType.Linear);

        expect(actual).toBe(dataSeries);
      });

      it('should allow object config', () => {
        const actual = testModule.fitFunction(
          dataSeries,
          {
            type: Fit.None,
          },
          ScaleType.Linear,
        );

        expect(actual).toBe(dataSeries);
      });

      describe('Fit Types', () => {
        describe('None', () => {
          it('should return original dataSeries', () => {
            const actual = testModule.fitFunction(dataSeries, Fit.None, ScaleType.Linear);

            expect(actual).toBe(dataSeries);
          });
        });
      });
    });
  });
});
