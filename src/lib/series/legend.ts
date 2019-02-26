import { findSelectedDataSeries } from '../../state/utils';
import { SpecId } from '../utils/ids';
import { DataSeriesColorsValues } from './series';
import { BasicSeriesSpec } from './specs';

export interface LegendItem {
  color: string;
  label: string;
  value: DataSeriesColorsValues;
  isSelected?: boolean;
}
export function computeLegend(
  seriesColor: Map<string, DataSeriesColorsValues>,
  seriesColorMap: Map<string, string>,
  specs: Map<SpecId, BasicSeriesSpec>,
  defaultColor: string,
  selectedDataSeries?: DataSeriesColorsValues[] | null,
): LegendItem[] {
  const legendItems: LegendItem[] = [];
  seriesColor.forEach((series, key) => {
    const color = seriesColorMap.get(key) || defaultColor;
    let label = '';

    if (seriesColor.size === 1 || series.colorValues.length === 0 || !series.colorValues[0]) {
      const spec = specs.get(series.specId);
      if (!spec) {
        return;
      }
      label = `${spec.id}`;
    } else {
      label = series.colorValues.join(' - ');
    }

    const isSelected = selectedDataSeries ? findSelectedDataSeries(selectedDataSeries, series) > -1 : true;

    legendItems.push({
      color,
      label,
      value: series,
      isSelected,
    });
  });
  return legendItems;
}
