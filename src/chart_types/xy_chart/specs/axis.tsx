import { AxisSpec, Position, DEFAULT_GLOBAL_ID } from '../utils/specs';
import { ChartTypes } from '../../../chart_types';
import { specComponentFactory, getConnect } from '../../../state/spec_factory';

const defaultProps = {
  chartType: ChartTypes.XYAxis,
  specType: 'axis' as 'axis',
  groupId: DEFAULT_GLOBAL_ID,
  hide: false,
  showOverlappingTicks: false,
  showOverlappingLabels: false,
  position: Position.Left,
  tickSize: 10,
  tickPadding: 10,
  tickFormat: (tick: any) => `${tick}`,
  tickLabelRotation: 0,
};

export const Axis = getConnect()(
  specComponentFactory<
    AxisSpec,
    | 'groupId'
    | 'hide'
    | 'showOverlappingTicks'
    | 'showOverlappingLabels'
    | 'position'
    | 'tickSize'
    | 'tickPadding'
    | 'tickFormat'
    | 'tickLabelRotation'
  >(defaultProps),
);
