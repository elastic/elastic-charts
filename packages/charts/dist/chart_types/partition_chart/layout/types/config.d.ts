import { Color } from '../../../../common/colors';
import { SizeRatio, Distance, Radian, Radius, Ratio, Pixels, TimeMs } from '../../../../common/geometry';
import { FontFamily } from '../../../../common/text_utils';
import { StrokeStyle } from '../../../../utils/common';
import { FillFontSizeRange, FillLabelConfig, LinkLabelConfig } from '../../../../utils/themes/partition';
import { AnimKeyframe, PartitionLayout } from './config_types';
/** @public */
export interface RelativeMargins {
    left: SizeRatio;
    right: SizeRatio;
    top: SizeRatio;
    bottom: SizeRatio;
}
interface StaticConfig extends FillFontSizeRange {
    width: number;
    height: number;
    margin: RelativeMargins;
    emptySizeRatio: SizeRatio;
    outerSizeRatio: SizeRatio;
    clockwiseSectors: boolean;
    specialFirstInnermostSector: boolean;
    partitionLayout: PartitionLayout;
    drilldown: boolean;
    fontFamily: FontFamily;
    circlePadding: Distance;
    radialPadding: Distance;
    horizontalTextAngleThreshold: Radian;
    horizontalTextEnforcer: Ratio;
    maxRowCount: number;
    fillOutside: boolean;
    radiusOutside: Radius;
    fillRectangleWidth: Distance;
    fillRectangleHeight: Distance;
    fillLabel: FillLabelConfig;
    linkLabel: LinkLabelConfig;
    backgroundColor: Color;
    sectorLineWidth: Pixels;
    sectorLineStroke: StrokeStyle;
}
/**
 * Old config object for partition charts
 *
 * @deprecated assign values to theme.partition or PartitionSpec instead
 * @public
 */
export interface PartitionConfig extends StaticConfig {
    /** @alpha */
    animation: {
        duration: TimeMs;
        keyframes: Array<AnimKeyframe & {
            keyframeConfig: Partial<StaticConfig>;
        }>;
    };
}
export {};
//# sourceMappingURL=config.d.ts.map