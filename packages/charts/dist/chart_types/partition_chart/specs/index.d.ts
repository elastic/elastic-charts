import { ComponentProps } from 'react';
import { ChartType } from '../..';
import { LegacyAnimationConfig } from '../../../common/animation';
import { Distance, Pixels, Radius } from '../../../common/geometry';
import { BaseDatum, Spec } from '../../../specs';
import { SpecType } from '../../../specs/constants';
import { SFProps } from '../../../state/spec_factory';
import { IndexedAccessorFn } from '../../../utils/accessor';
import { Datum, LabelAccessor, ShowAccessor, ValueAccessor, ValueFormatter } from '../../../utils/common';
import { FillFontSizeRange, FillLabelConfig } from '../../../utils/themes/partition';
import { PartitionLayout } from '../layout/types/config_types';
import { NodeColorAccessor, ValueGetter } from '../layout/types/viewmodel_types';
import { NodeSorter } from '../layout/utils/group_by_rollup';
interface ExtendedFillLabelConfig extends FillLabelConfig, FillFontSizeRange {
    valueFormatter: ValueFormatter;
}
/**
 * Specification for a given layer in the partition chart
 * @public
 */
export interface Layer<D extends BaseDatum = Datum> {
    groupByRollup: IndexedAccessorFn<D>;
    sortPredicate?: NodeSorter | null;
    nodeLabel?: LabelAccessor;
    fillLabel?: Partial<ExtendedFillLabelConfig>;
    showAccessor?: ShowAccessor;
    shape?: {
        fillColor: string | NodeColorAccessor;
    };
}
/**
 * Specifies the partition chart
 * @public
 */
export interface PartitionSpec<D extends BaseDatum = Datum> extends Spec, LegacyAnimationConfig {
    specType: typeof SpecType.Series;
    chartType: typeof ChartType.Partition;
    data: D[];
    valueAccessor: ValueAccessor<D>;
    valueFormatter: ValueFormatter;
    valueGetter: ValueGetter;
    percentFormatter: ValueFormatter;
    topGroove: Pixels;
    smallMultiples: string | null;
    layers: Layer<D>[];
    /**
     * Largest to smallest sectors are positioned in a clockwise order
     */
    clockwiseSectors: boolean;
    /**
     * Starts placement with the second largest slice, for the innermost pie/ring
     */
    specialFirstInnermostSector: boolean;
    layout: PartitionLayout;
    maxRowCount: number;
    /** @alpha */
    drilldown: boolean;
    fillOutside: boolean;
    radiusOutside: Radius;
    fillRectangleWidth: Distance;
    fillRectangleHeight: Distance;
}
declare const buildProps: import("../../../state/spec_factory").BuildProps<PartitionSpec<any>, "chartType" | "specType", "animation" | "layout" | "layers" | "valueFormatter" | "valueGetter" | "fillOutside" | "radiusOutside" | "fillRectangleWidth" | "fillRectangleHeight" | "topGroove" | "percentFormatter" | "clockwiseSectors" | "maxRowCount" | "specialFirstInnermostSector" | "valueAccessor" | "smallMultiples" | "drilldown", never, "id" | "data">;
/**
 * Adds partition spec to chart specs
 * @public
 */
export declare const Partition: <D extends BaseDatum = any>(props: SFProps<PartitionSpec<D>, "chartType" | "specType", "animation" | "layout" | "layers" | "valueFormatter" | "valueGetter" | "fillOutside" | "radiusOutside" | "fillRectangleWidth" | "fillRectangleHeight" | "topGroove" | "percentFormatter" | "clockwiseSectors" | "maxRowCount" | "specialFirstInnermostSector" | "valueAccessor" | "smallMultiples" | "drilldown", never, "id" | "data">) => null;
/** @public */
export type PartitionProps = ComponentProps<typeof Partition>;
export {};
//# sourceMappingURL=index.d.ts.map