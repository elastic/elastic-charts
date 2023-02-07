/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { AccessorFn } from './accessor';
import { computeContinuousDataDomain, computeDomainExtent, computeOrdinalDataDomain } from './domain';
import { ScaleType } from '../scales/constants';
import { DomainPaddingUnit } from '../specs';

describe('utils/domain', () => {
  test('should return [] domain if no data', () => {
    const data: any[] = [];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = true;
    const removeNull = true;

    const ordinalDataDomain = computeOrdinalDataDomain(data.map(accessor), isSorted, removeNull);

    expect(ordinalDataDomain).toEqual([]);
  });

  test('should compute ordinal data domain: sort & remove nulls', () => {
    const data = [{ x: 'd' }, { x: 'a' }, { x: null }, { x: 'b' }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = true;
    const removeNull = true;

    const ordinalDataDomain = computeOrdinalDataDomain(data.map(accessor), isSorted, removeNull);

    const expectedOrdinalDomain = ['a', 'b', 'd'];

    expect(ordinalDataDomain).toEqual(expectedOrdinalDomain);
  });

  test('should compute ordinal data domain: unsorted and remove nulls', () => {
    const data = [{ x: 'd' }, { x: 'a' }, { x: null }, { x: 'b' }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = false;
    const removeNull = true;

    const ordinalDataDomain = computeOrdinalDataDomain(data.map(accessor), isSorted, removeNull);

    const expectedOrdinalDomain = ['d', 'a', 'b'];

    expect(ordinalDataDomain).toEqual(expectedOrdinalDomain);
  });

  test('should compute ordinal data domain: sorted and keep nulls', () => {
    const data = [{ x: 'd' }, { x: 'a' }, { x: null }, { x: 'b' }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = true;
    const removeNull = false;

    const ordinalDataDomain = computeOrdinalDataDomain(data.map(accessor), isSorted, removeNull);

    const expectedOrdinalDomain = ['a', 'b', 'd', null];

    expect(ordinalDataDomain).toEqual(expectedOrdinalDomain);
  });

  test('should compute ordinal data domain: unsorted and keep nulls', () => {
    const data = [{ x: 'd' }, { x: 'a' }, { x: null }, { x: 'b' }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = false;
    const removeNull = false;

    const ordinalDataDomain = computeOrdinalDataDomain(data.map(accessor), isSorted, removeNull);

    const expectedOrdinalDomain = ['d', 'a', null, 'b'];

    expect(ordinalDataDomain).toEqual(expectedOrdinalDomain);
  });

  test('should compute continuous data domain: data scaled to extent', () => {
    const data = [{ x: 12 }, { x: 6 }, { x: 8 }];
    const accessor = (datum: any) => datum.x;
    const domainOptions = { min: NaN, max: NaN, fit: true };
    const continuousDataDomain = computeContinuousDataDomain(data.map(accessor), ScaleType.Linear, domainOptions);
    const expectedContinuousDomain = [6, 12];

    expect(continuousDataDomain).toEqual(expectedContinuousDomain);
  });

  test('should compute continuous data domain: data not scaled to extent', () => {
    const data = [{ x: 12 }, { x: 6 }, { x: 8 }];
    const accessor = (datum: any) => datum.x;
    const domainOptions3 = { min: NaN, max: NaN };
    const continuousDataDomain = computeContinuousDataDomain(data.map(accessor), ScaleType.Linear, domainOptions3);
    const expectedContinuousDomain = [0, 12];

    expect(continuousDataDomain).toEqual(expectedContinuousDomain);
  });

  test('should compute continuous data domain: empty data not scaled to extent', () => {
    const continuousDataDomain = computeContinuousDataDomain([], ScaleType.Linear, undefined);
    const expectedContinuousDomain = [0, 0];

    expect(continuousDataDomain).toEqual(expectedContinuousDomain);
  });

  test('should filter zeros on log scale domain when fit is true', () => {
    const data: number[] = [0.0001, 0, 1, 0, 10, 0, 100, 0, 0, 1000];
    const domainOptions1 = { fit: true, min: NaN, max: NaN };
    const continuousDataDomain = computeContinuousDataDomain(data, ScaleType.Log, domainOptions1);

    expect(continuousDataDomain).toEqual([0.0001, 1000]);
  });

  test('should not filter zeros on log scale domain when fit is false', () => {
    const data: number[] = [0.0001, 0, 1, 0, 10, 0, 100, 0, 0, 1000];
    const domainOptions2 = { fit: false, min: NaN, max: NaN };
    const continuousDataDomain = computeContinuousDataDomain(data, ScaleType.Log, domainOptions2);

    expect(continuousDataDomain).toEqual([0, 1000]);
  });

  describe('YDomainOptions', () => {
    it('should not effect domain when domain.fit is true', () => {
      expect(computeDomainExtent([5, 10], { fit: true, min: NaN, max: NaN })).toEqual([5, 10]);
    });

    // Note: padded domains are possible with log scale but not very practical
    it('should not effect positive domain if log scale with padding', () => {
      expect(computeDomainExtent([0.001, 10], { padding: 5, min: NaN, max: NaN })).toEqual([0, 15]);
    });

    it('should not effect negative domain if log scale with padding', () => {
      expect(computeDomainExtent([-10, -0.001], { padding: 5, min: NaN, max: NaN })).toEqual([-15, 0]);
    });

    describe('domain.fit is true', () => {
      it('should find domain when start & end are positive', () => {
        expect(computeDomainExtent([5, 10], { fit: true, min: NaN, max: NaN })).toEqual([5, 10]);
      });

      it('should find domain when start & end are negative', () => {
        expect(computeDomainExtent([-15, -10], { fit: true, min: NaN, max: NaN })).toEqual([-15, -10]);
      });

      it('should find domain when start is negative, end is positive', () => {
        expect(computeDomainExtent([-15, 10], { fit: true, min: NaN, max: NaN })).toEqual([-15, 10]);
      });
    });
    describe('domain.fit is false', () => {
      it('should find domain when start & end are positive', () => {
        expect(computeDomainExtent([5, 10], { min: NaN, max: NaN })).toEqual([0, 10]);
      });

      it('should find domain when start & end are negative', () => {
        expect(computeDomainExtent([-15, -10], { min: NaN, max: NaN })).toEqual([-15, 0]);
      });

      it('should find domain when start is negative, end is positive', () => {
        expect(computeDomainExtent([-15, 10], { min: NaN, max: NaN })).toEqual([-15, 10]);
      });
    });

    describe('padding does NOT cause domain to cross zero baseline', () => {
      it('should get domain from positive domain', () => {
        expect(computeDomainExtent([10, 70], { fit: true, padding: 5, min: NaN, max: NaN })).toEqual([5, 75]);
      });

      it('should get domain from positive & negative domain', () => {
        expect(computeDomainExtent([-30, 30], { fit: true, padding: 5, min: NaN, max: NaN })).toEqual([-35, 35]);
      });

      it('should get domain from negative domain', () => {
        expect(computeDomainExtent([-70, -10], { fit: true, padding: 5, min: NaN, max: NaN })).toEqual([-75, -5]);
      });

      it('should use absolute padding value', () => {
        expect(computeDomainExtent([10, 70], { fit: true, padding: -5, min: NaN, max: NaN })).toEqual([5, 75]);
      });
    });

    describe('padding caused domain to cross zero baseline', () => {
      describe('constrainPadding true - default', () => {
        it('should set min baseline as 0 if original domain is less than zero', () => {
          expect(computeDomainExtent([5, 65], { fit: true, padding: 15, min: NaN, max: NaN })).toEqual([0, 80]);
        });

        it('should set max baseline as 0 if original domain is less than zero', () => {
          expect(computeDomainExtent([-65, -5], { fit: true, padding: 15, min: NaN, max: NaN })).toEqual([-80, 0]);
        });
      });

      describe('constrainPadding false', () => {
        const domainOptions = { fit: true, padding: 15, constrainPadding: false, min: NaN, max: NaN };
        it('should allow min past baseline as 0, even if original domain is less than zero', () => {
          expect(computeDomainExtent([5, 65], domainOptions)).toEqual([-10, 80]);
        });

        it('should allow max past baseline as 0, even if original domain is less than zero', () => {
          expect(computeDomainExtent([-65, -5], domainOptions)).toEqual([-80, 10]);
        });
      });
    });

    describe('padding units', () => {
      // Note: domain pixel padding computed in continuous scale
      it('should not change domain when using Pixel padding unit', () => {
        const domainOptions = { fit: true, padding: 15, paddingUnit: DomainPaddingUnit.Pixel, min: NaN, max: NaN };
        expect(computeDomainExtent([5, 65], domainOptions)).toEqual([5, 65]);
      });
      const domainOptions1 = {
        fit: true,
        padding: 0.5,
        paddingUnit: DomainPaddingUnit.DomainRatio,
        min: NaN,
        max: NaN,
      };
      it('should handle DomainRatio padding unit', () => {
        expect(computeDomainExtent([50, 60], domainOptions1)).toEqual([45, 65]);
      });
      it('should handle negative inverted DomainRatio padding unit', () => {
        expect(computeDomainExtent([-50, -60], domainOptions1)).toEqual([-45, -65]);
      });
      it('should handle negative inverted Domain padding unit', () => {
        expect(
          computeDomainExtent([-50, -60], {
            fit: true,
            padding: 10,
            paddingUnit: DomainPaddingUnit.Domain,
            min: NaN,
            max: NaN,
          }),
        ).toEqual([-40, -70]);
      });
    });
  });
});
