import { Spec } from '../../../specs';
import { ChartTypes } from '../..';
import { SpecTypes, Datum } from '../../xy_chart/utils/specs';
import { Accessor } from '../../../utils/accessor';

export interface PieSpec extends Spec {
  specType: typeof SpecTypes.Series;
  chartType: typeof ChartTypes.Pie;
  yAccessor: Accessor;
  data: Datum[];
  donut: boolean;
}
