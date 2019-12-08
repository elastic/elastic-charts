import { SunburstSpec } from './sunburst_spec';
import { ChartTypes } from '../../index';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { Datum, SpecTypes } from '../../xy_chart/utils/specs';
import { FunctionComponent } from 'react';
import { config } from '../layout/circline/config/config';

const defaultProps = {
  chartType: ChartTypes.Sunburst,
  specType: SpecTypes.Series,
  config,
  valueAccessor: (d: Datum) => d,
  valueFormatter: (d: any) => d,
  layers: [
    {
      groupByRollup: (d: Datum) => d,
      nodeLabel: (d: Datum) => d,
    },
  ],
};

type SpecRequiredProps = Pick<SunburstSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<SunburstSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

export const Sunburst: FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<SunburstSpec, 'valueAccessor' | 'valueFormatter' | 'layers' | 'config'>(defaultProps),
);
