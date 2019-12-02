import { PieSpec } from './pie_spec';
import { ChartTypes } from '../../../chart_types';
import { specComponentFactory, getConnect } from '../../../state/spec_factory';
import { SpecTypes } from '../../xy_chart/utils/specs';

const defaultProps = {
  chartType: ChartTypes.Pie,
  specType: SpecTypes.Series,
  yAccessor: 'y',
  donut: false,
};

type SpecRequiredProps = Pick<PieSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<PieSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

export const Pie: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<PieSpec, 'yAccessor' | 'donut'>(defaultProps),
);
