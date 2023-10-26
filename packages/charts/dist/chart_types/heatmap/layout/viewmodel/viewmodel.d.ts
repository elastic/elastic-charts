import { SmallMultiplesDatum } from '../../../../common/panel_utils';
import { PrimitiveValue } from '../../../partition_chart/layout/utils/group_by_rollup';
/** @public */
export interface HeatmapCellDatum extends SmallMultiplesDatum {
    x: NonNullable<PrimitiveValue>;
    y: NonNullable<PrimitiveValue>;
    value: number;
    originalIndex: number;
}
//# sourceMappingURL=viewmodel.d.ts.map