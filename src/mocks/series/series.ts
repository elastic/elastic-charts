import { shuffle } from 'lodash';

import { mergePartial } from '../../utils/commons';
import { getSpecId } from '../..';
import { DataSeries, DataSeriesDatum } from '../../chart_types/xy_chart/utils/series';
import { fitFunctionData } from './data';
import { FullDataSeriesDatum } from '../../chart_types/xy_chart/utils/fit_function';

export class MockDataSeries {
  private static readonly base: DataSeries = {
    specId: getSpecId('spec1'),
    key: ['spec1'],
    seriesColorKey: 'spec1',
    data: [],
  };

  static default(partial: Partial<DataSeries>) {
    return mergePartial<DataSeries>(MockDataSeries.base, partial, { mergeOptionalPartialValues: true });
  }

  static fitFunction(options: { shuffle: boolean } = { shuffle: true }): DataSeries {
    const data = options && options.shuffle ? shuffle(fitFunctionData) : fitFunctionData;
    return {
      ...MockDataSeries.base,
      data,
    };
  }

  static withData(data: DataSeries['data']): DataSeries {
    return {
      ...MockDataSeries.base,
      data,
    };
  }
}

export class MockDataSeriesDatum {
  private static readonly base: DataSeriesDatum = {
    x: 1,
    y1: 1,
    y0: 1,
    initialY1: 1,
    initialY0: 1,
    datum: {},
  };

  static default(partial?: Partial<DataSeriesDatum>): DataSeriesDatum {
    return mergePartial<DataSeriesDatum>(MockDataSeriesDatum.base, partial, { mergeOptionalPartialValues: true });
  }

  /**
   * Fill datum with minimal values, default missing required values to `null`
   */
  static simple({
    x,
    y1 = null,
    y0 = null,
    filled,
  }: Partial<DataSeriesDatum> & Pick<DataSeriesDatum, 'x'>): DataSeriesDatum {
    return {
      x,
      y1,
      y0,
      initialY1: y1,
      initialY0: y0,
      ...(filled && filled),
    };
  }

  /**
   * returns "full" datum with minimal values, default missing required values to `null`
   *
   * "full" - means x and y1 values are `non-nullable`
   */
  static full(datum: Partial<FullDataSeriesDatum> & Pick<FullDataSeriesDatum, 'x' | 'y1'>): FullDataSeriesDatum {
    return MockDataSeriesDatum.simple(datum) as FullDataSeriesDatum;
  }

  static ordinal(partial?: Partial<DataSeriesDatum>): DataSeriesDatum {
    return mergePartial<DataSeriesDatum>(
      {
        ...MockDataSeriesDatum.base,
        x: 'a',
      },
      partial,
      { mergeOptionalPartialValues: true },
    );
  }
}
