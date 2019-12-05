import { SunburstSpec } from './sunburst_spec';
import { ChartTypes } from '../../index';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { SpecTypes } from '../../xy_chart/utils/specs';
import { FunctionComponent } from 'react';

const defaultProps = {
  chartType: ChartTypes.Sunburst,
  specType: SpecTypes.Series,
  yAccessor: 'y',
  donut: false,
};

type SpecRequiredProps = Pick<SunburstSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<SunburstSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

export const Sunburst: FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<SunburstSpec, 'yAccessor' | 'donut'>(defaultProps),
);
