import { ChartTypes } from '../../index';
import { Datum, SpecTypes } from '../../xy_chart/utils/specs';
import { config } from '../layout/config/config';
import { FunctionComponent } from 'react';
import { getConnect, specComponentFactory } from '../../../state/spec_factory';
import { AccessorFn } from '../../../utils/accessor';
import { Spec } from '../../../specs/index';
import { Config, FillLabel } from '../layout/types/config_types';

export interface Layer {
  groupByRollup: AccessorFn;
  nodeLabel?: AccessorFn;
  fillLabel?: Partial<FillLabel>;
  shape?: { fillColor: any };
}

const defaultProps = {
  chartType: ChartTypes.Partition,
  specType: SpecTypes.Series,
  config,
  valueAccessor: (d: Datum) => d,
  valueFormatter: (d: any) => d,
  layers: [
    {
      groupByRollup: (d: Datum) => d,
      nodeLabel: (d: Datum) => d,
      fillLabel: {},
    },
  ],
};

export interface PartitionSpec extends Spec {
  specType: typeof SpecTypes.Series;
  chartType: typeof ChartTypes.Partition;
  config: Config;
  data: Datum[];
  valueAccessor: AccessorFn;
  valueFormatter: AccessorFn;
  layers: Layer[];
}

type SpecRequiredProps = Pick<PartitionSpec, 'id' | 'data'>;
type SpecOptionalProps = Partial<Omit<PartitionSpec, 'chartType' | 'specType' | 'id' | 'data'>>;

export const Partition: FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<PartitionSpec, 'valueAccessor' | 'valueFormatter' | 'layers' | 'config'>(defaultProps),
);
