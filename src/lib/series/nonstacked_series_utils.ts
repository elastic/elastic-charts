import { DataSeries, DataSeriesDatum, RawDataSeries } from './series';

export function formatNonStackedDataSeriesValues(dataseries: RawDataSeries[], scaleToExtent: boolean): DataSeries[] {
  const len = dataseries.length;
  let i;
  const formattedValues: DataSeries[] = [];
  for (i = 0; i < len; i++) {
    const formattedValue = formatNonStackedDataValues(dataseries[i], scaleToExtent);
    formattedValues.push(formattedValue);
  }

  return formattedValues;
}

export function formatNonStackedDataValues(dataSeries: RawDataSeries, scaleToExtent: boolean): DataSeries {
  const formattedValues: DataSeries = {
    keys: dataSeries.keys,
    specId: dataSeries.specId,
    seriesKey: dataSeries.seriesKey,
    data: new Map(),
  };

  for (const [group, series] of dataSeries.data) {
    const len = series.length;
    const formatted = [];

    for (let i = 0; i < len; i++) {
      const data = series[i];
      const { x, y1, datum, xAccessor, yAccessor } = data;
      let y0: number | null;
      if (y1 === null) {
        y0 = null;
      } else {
        if (scaleToExtent) {
          y0 = data.y0 ? data.y0 : y1;
        } else {
          y0 = data.y0 ? data.y0 : 0;
        }
      }

      const formattedValue: DataSeriesDatum = {
        x,
        y1,
        y0,
        xAccessor,
        yAccessor,
        initialY1: y1,
        initialY0: data.y0 == null || y1 === null ? null : data.y0,
        datum,
      };
      formatted.push(formattedValue);
    }

    if (!formattedValues.data.has(group)) {
      formattedValues.data.set(group, []);
    }

    formattedValues.data.get(group)!.push(...formatted);
  }

  return formattedValues;
}
