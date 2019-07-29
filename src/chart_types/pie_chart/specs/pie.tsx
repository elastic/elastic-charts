import { specComponentFactory, getConnect } from 'store/spec_factory';
import { Spec } from 'specs';
import { Accessor } from 'utils/accessor';

export interface PieSpec extends Spec {
  data: any[];
  accessor: Accessor;
  donut: boolean;
}

export const Pie = getConnect()(
  specComponentFactory<PieSpec, 'accessor' | 'donut'>({
    chartType: 'pie',
    specType: 'pie',
    accessor: 'x',
    donut: false,
  }),
);
