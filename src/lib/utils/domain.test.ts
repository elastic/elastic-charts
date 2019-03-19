import { AccessorFn } from './accessor';
import { computeOrdinalDataDomain, computeContinuousDataDomain, computeStackedContinuousDomain } from './domain';

describe('utils/domain', () => {
  test('should compute ordinal data domain: sort & remove nulls', () => {
    const data = [{ x: 'd' }, { x: 'a' }, { x: null }, { x: 'b' }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = true;
    const removeNull = true;

    const ordinalDataDomain = computeOrdinalDataDomain(
      data,
      accessor,
      isSorted,
      removeNull,
    );

    const expectedOrdinalDomain = ['a', 'b', 'd'];

    expect(ordinalDataDomain).toEqual(expectedOrdinalDomain);
  });

  test('should compute ordinal data domain: unsorted and remove nulls', () => {
    const data = [{ x: 'd' }, { x: 'a' }, { x: null }, { x: 'b' }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = false;
    const removeNull = true;

    const ordinalDataDomain = computeOrdinalDataDomain(
      data,
      accessor,
      isSorted,
      removeNull,
    );

    const expectedOrdinalDomain = ['d', 'a', 'b'];

    expect(ordinalDataDomain).toEqual(expectedOrdinalDomain);
  });

  test('should compute ordinal data domain: sorted and keep nulls', () => {
    const data = [{ x: 'd' }, { x: 'a' }, { x: null }, { x: 'b' }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = true;
    const removeNull = false;

    const ordinalDataDomain = computeOrdinalDataDomain(
      data,
      accessor,
      isSorted,
      removeNull,
    );

    const expectedOrdinalDomain = ['a', 'b', 'd', null];

    expect(ordinalDataDomain).toEqual(expectedOrdinalDomain);
  });

  test('should compute ordinal data domain: unsorted and keep nulls', () => {
    const data = [{ x: 'd' }, { x: 'a' }, { x: null }, { x: 'b' }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const isSorted = false;
    const removeNull = false;

    const ordinalDataDomain = computeOrdinalDataDomain(
      data,
      accessor,
      isSorted,
      removeNull,
    );

    const expectedOrdinalDomain = ['d', 'a', null, 'b'];

    expect(ordinalDataDomain).toEqual(expectedOrdinalDomain);
  });

  test('should compute continuous data domain: data scaled to extent', () => {
    const data = [{ x: 12 }, { x: 6 }, { x: 8 }];
    const accessor: AccessorFn = (datum: any) => datum.x;
    const scaleToExtent = true;

    const continuousDataDomain = computeContinuousDataDomain(
      data,
      accessor,
      scaleToExtent,
    );

    const expectedContinuousDomain = [6, 12];

    expect(continuousDataDomain).toEqual(expectedContinuousDomain);
  });

  test('should compute continuous data domain: data not scaled to extent', () => {
    const data = [{ x: 12 }, { x: 6 }, { x: 8 }];
    const accessor: AccessorFn = (datum: any) => datum.x;

    const continuousDataDomain = computeContinuousDataDomain(
      data,
      accessor,
    );

    const expectedContinuousDomain = [0, 12];

    expect(continuousDataDomain).toEqual(expectedContinuousDomain);
  });

  test('should compute continuous data domain: empty data not scaled to extent', () => {
    const data: any[] = [];
    const accessor: AccessorFn = (datum: any) => datum.x;

    const continuousDataDomain = computeContinuousDataDomain(
      data,
      accessor,
    );

    const expectedContinuousDomain = [0, 0];

    expect(continuousDataDomain).toEqual(expectedContinuousDomain);
  });

  test('should compute stacked data domain: data scaled to extent', () => {
    const data = [{ x: 12, y: 'a' }, { x: 6, y: 'b' }, { x: 8, y: 'a' }];
    const yAccessor: AccessorFn = (datum: any) => datum.x;
    const xAccessor: AccessorFn = (datum: any) => datum.y;
    const scaleToExtent = true;

    const stackedDataDomain = computeStackedContinuousDomain(
      data,
      xAccessor,
      yAccessor,
      scaleToExtent,
    );

    const expectedStackedDomain = [6, 20];

    expect(stackedDataDomain).toEqual(expectedStackedDomain);
  });

  test('should compute stacked data domain: data not scaled to extent', () => {
    const data = [{ x: 12, y: 'a' }, { x: 6, y: 'b' }, { x: 8, y: 'a' }];
    const yAccessor: AccessorFn = (datum: any) => datum.x;
    const xAccessor: AccessorFn = (datum: any) => datum.y;

    const stackedDataDomain = computeStackedContinuousDomain(
      data,
      xAccessor,
      yAccessor,
    );

    const expectedStackedDomain = [0, 20];

    expect(stackedDataDomain).toEqual(expectedStackedDomain);
  });
});
