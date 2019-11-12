import { getSpecsFromStore } from './utils';
import { ChartTypes } from '../chart_types';

describe('State utils', () => {
  it('getSpecsFromStore shall return always the same object reference excluding the array', () => {
    const spec1 = { id: 'id1', chartType: ChartTypes.XYAxis, specType: 'series' };
    const specs = getSpecsFromStore({ id1: spec1 }, 'xy_axis', 'series');
    expect(specs[0]).toBe(spec1);
  });
});
