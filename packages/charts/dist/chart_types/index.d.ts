import { $Values } from 'utility-types';
/**
 * Available chart types
 * @public
 */
export declare const ChartType: Readonly<{
    Global: "global";
    Goal: "goal";
    Partition: "partition";
    Flame: "flame";
    Timeslip: "timeslip";
    XYAxis: "xy_axis";
    Heatmap: "heatmap";
    Wordcloud: "wordcloud";
    Metric: "metric";
}>;
/** @public */
export type ChartType = $Values<typeof ChartType>;
//# sourceMappingURL=index.d.ts.map