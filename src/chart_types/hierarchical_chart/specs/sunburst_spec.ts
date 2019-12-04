import { Spec } from '../../../specs';
import { ChartTypes } from '../..';
import { SpecTypes, Datum } from '../../xy_chart/utils/specs';
import { Accessor } from '../../../utils/accessor';

export interface SunburstSpec extends Spec {
  specType: typeof SpecTypes.Series;
  chartType: typeof ChartTypes.Sunburst;
  yAccessor: Accessor;
  data: Datum[];
  donut: boolean;
}
