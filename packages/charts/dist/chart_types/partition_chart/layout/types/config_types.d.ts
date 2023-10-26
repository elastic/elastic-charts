import { $Values } from 'utility-types';
import { Ratio } from '../../../../common/geometry';
/** @public */
export declare const PartitionLayout: Readonly<{
    sunburst: "sunburst";
    treemap: "treemap";
    icicle: "icicle";
    flame: "flame";
    mosaic: "mosaic";
    waffle: "waffle";
}>;
/** @public */
export type PartitionLayout = $Values<typeof PartitionLayout>;
/** @alpha */
export type EasingFunction = (x: Ratio) => Ratio;
/** @alpha */
export interface AnimKeyframe {
    time: number;
    easingFunction: EasingFunction;
}
//# sourceMappingURL=config_types.d.ts.map