import { $Values } from 'utility-types';

export const ChartTypes = Object.freeze({
  Global: 'global' as 'global',
  Sunburst: 'sunburst' as 'sunburst',
  XYAxis: 'xy_axis' as 'xy_axis',
});

export type ChartTypes = $Values<typeof ChartTypes>;
