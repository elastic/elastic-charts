import { Spec } from '../../../specs';
import { ChartTypes } from '../..';
import { Datum, SpecTypes } from '../../xy_chart/utils/specs';
import { AccessorFn } from '../../../utils/accessor';
import { Config } from '../layout/circline/types/ConfigTypes';

interface Layer {
  groupByRollup: AccessorFn;
  nodeLabel: AccessorFn;
}

export interface SunburstSpec extends Spec {
  specType: typeof SpecTypes.Series;
  chartType: typeof ChartTypes.Sunburst;
  config: Config;
  data: Datum[];
  valueAccessor: AccessorFn;
  valueFormatter: AccessorFn;
  layers: Layer[];
}
