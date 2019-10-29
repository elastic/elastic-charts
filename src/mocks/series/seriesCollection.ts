export class MockSeriesCollection {
  private static readonly base: DataSeries = {
    specId: getSpecId('spec1'),
    seriesKeys: ['spec1'],
    yAccessor: 'y',
    splitAccessors: new Map(),
    key: 'spec1',
    data: [],
  };

  static default(partial?: Partial<DataSeries>) {
    return mergePartial<DataSeries>(MockSeriesCollection.base, partial, { mergeOptionalPartialValues: true });
  }

  static fitFunction(
    options: { shuffle?: boolean; ordinal?: boolean } = { shuffle: true, ordinal: false },
  ): DataSeries {
    const ordinalData = options.ordinal
      ? fitFunctionData.map((d) => ({ ...d, x: String.fromCharCode(97 + (d.x as number)) }))
      : fitFunctionData;
    const data = options.shuffle && !options.ordinal ? shuffle(ordinalData) : ordinalData;

    return {
      ...MockSeriesCollection.base,
      data,
    };
  }

  static withData(data: DataSeries['data']): DataSeries {
    return {
      ...MockSeriesCollection.base,
      data,
    };
  }
}
