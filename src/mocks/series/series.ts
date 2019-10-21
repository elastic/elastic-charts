import { mergePartial } from '../../utils/commons';
import { getSpecId } from '../..';
import { DataSeries, DataSeriesDatum } from '../../chart_types/xy_chart/utils/series';

import { fitFunctionData } from './data';

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

  static fitFunction(): DataSeries {
    return {
      ...MockDataSeries.base,
      data: fitFunctionData,
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
    datum: 1,
  };

  static default(partial: Partial<DataSeriesDatum>) {
    return mergePartial<DataSeriesDatum>(MockDataSeriesDatum.base, partial, { mergeOptionalPartialValues: true });
  }

  static ordinal(partial: Partial<DataSeriesDatum>) {
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
