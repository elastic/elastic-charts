import { inject } from 'mobx-react';
import { PureComponent } from 'react';
import { BarSeriesSpec } from '../lib/series/specs';
import { getGroupId } from '../lib/utils/ids';
import { ScaleType } from '../lib/utils/scales/scales';
import { SpecProps } from './specs_parser';

type BarSpecProps = SpecProps & BarSeriesSpec;

export class BarSeriesSpecComponent extends PureComponent<BarSpecProps> {
  static defaultProps: Partial<BarSpecProps> = {
    seriesType: 'bar',
    groupId: getGroupId('__global__'),
    xScaleType: ScaleType.Ordinal,
    yScaleType: ScaleType.Linear,
    xAccessor: 'x',
    yAccessors: ['y'],
    yScaleToDataExtent: false,
    hideInLegend: false,
  };
  componentDidMount() {
    const { chartStore, children, ...config } = this.props;
    chartStore!.addSeriesSpec({ ...config });
  }
  componentDidUpdate(prevProps: BarSpecProps) {
    const { chartStore, children, ...config } = this.props;
    chartStore!.addSeriesSpec({ ...config });
    if (prevProps.id !== this.props.id) {
      chartStore!.removeSeriesSpec(prevProps.id);
    }
  }
  componentWillUnmount() {
    const { chartStore, id } = this.props;
    chartStore!.removeSeriesSpec(id);
  }
  render() {
    return null;
  }
}

export const BarSeries = inject('chartStore')(BarSeriesSpecComponent);
