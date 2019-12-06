import { Spec } from '../../../specs';
import { ChartTypes } from '../..';
import { SpecTypes, Datum } from '../../xy_chart/utils/specs';
import { Accessor } from '../../../utils/accessor';
import { Config } from '../layout/circline/types/ConfigTypes';

export interface SunburstSpec extends Spec {
  specType: typeof SpecTypes.Series;
  chartType: typeof ChartTypes.Sunburst;
  yAccessor: Accessor;
  config: Config;
  data: Datum[];
}
