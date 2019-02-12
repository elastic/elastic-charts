import { fitNullValues, FittingFunctions } from './fitting';
const array1 = [[0, 1], [0, 2], [0, 3], [0, null], [0, 5], [0, 6], [0, 7]];
const array2 = [[0, 1], [0, 2], [0, 3], [0, null], [0, null], [0, null], [0, 7]];
const array3 = [[0, null], [0, 2], [0, 3], [0, null], [0, null], [0, null], [0, 7]];
const array4 = [[0, 1], [0, 2], [0, null], [0, null]];
const array5 = [[0, 1, 2], [0, 2, 3], [0, null, null], [0, null, 7]];

describe('Fitting functions', () => {
  it('can fit null values with lookahead', () => {
    const fittedArray = fitNullValues(array1, 0, [1], FittingFunctions.Lookahead);
    expect(fittedArray).toEqual([[0, 1], [0, 2], [0, 3], [0, 5], [0, 5], [0, 6], [0, 7]]);
  });
  it('can fit null values with lookahead far away', () => {
    const fittedArray = fitNullValues(array2, 0, [1], FittingFunctions.Lookahead);
    expect(fittedArray).toEqual([[0, 1], [0, 2], [0, 3], [0, 7], [0, 7], [0, 7], [0, 7]]);
  });
  it('can fit null values with lookahead', () => {
    const fittedArray = fitNullValues(array3, 0, [1], FittingFunctions.Lookahead);
    expect(fittedArray).toEqual([[0, 2], [0, 2], [0, 3], [0, 7], [0, 7], [0, 7], [0, 7]]);
  });
  it('can fit null values with lookahead ending with null', () => {
    const fittedArray = fitNullValues(array4, 0, [1], FittingFunctions.Lookahead);
    expect(fittedArray).toEqual([[0, 1], [0, 2]]);
  });
  it('can fit null values with lookahead multi accessors', () => {
    const fittedArray = fitNullValues(array5, 0, [1, 2], FittingFunctions.Lookahead);
    expect(fittedArray).toEqual([[0, 1, 2], [0, 2, 3], [0, null, 7], [0, null, 7]]);
  });

  it('can fit null values with none', () => {
    const fittedArray = fitNullValues(array1, 0, [1], FittingFunctions.None, 111);
    expect(fittedArray).toEqual([[0, 1], [0, 2], [0, 3], [0, 111], [0, 5], [0, 6], [0, 7]]);
  });
  it('can fit null values with none', () => {
    const fittedArray = fitNullValues(array2, 0, [1], FittingFunctions.None, 111);
    expect(fittedArray).toEqual([[0, 1], [0, 2], [0, 3], [0, 111], [0, 111], [0, 111], [0, 7]]);
  });
  it('can fit null values with none', () => {
    const fittedArray = fitNullValues(array3, 0, [1], FittingFunctions.None, 111);
    expect(fittedArray).toEqual([[0, 111], [0, 2], [0, 3], [0, 111], [0, 111], [0, 111], [0, 7]]);
  });
});
