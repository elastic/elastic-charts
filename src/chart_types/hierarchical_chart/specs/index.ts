import { ChartTypes } from '../../index';
import { Datum, SpecTypes } from '../../xy_chart/utils/specs';
import { config } from '../layout/config/config';
import { FunctionComponent } from 'react';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { AccessorFn } from '../../../utils/accessor';
import { Spec } from '../../../specs/index';
import { Config } from '../layout/types/ConfigTypes';

interface Layer {
  groupByRollup: AccessorFn;
  nodeLabel?: AccessorFn;
}

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

export interface SunburstSpec extends Spec {
  specType: typeof SpecTypes.Series;
  chartType: typeof ChartTypes.Sunburst;
  config: Config;
  data: Datum[];
  valueAccessor: AccessorFn;
  valueFormatter: AccessorFn;
  layers: Layer[];
}

type SpecRequiredProps = Pick<SunburstSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<SunburstSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

export const Sunburst: FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<SunburstSpec, 'valueAccessor' | 'valueFormatter' | 'layers' | 'config'>(defaultProps),
);
