import { CSSProperties } from 'react';
import { TooltipTableColumn } from './types';
import { SeriesIdentifier } from '../../../common/series_id';
import { BaseDatum, TooltipValue } from '../../../specs';
import { Datum } from '../../../utils/common';
import { PropsOrChildrenWithProps, ToggleSelectedTooltipItemCallback } from '../types';
type TooltipTableProps<D extends BaseDatum = Datum, SI extends SeriesIdentifier = SeriesIdentifier> = PropsOrChildrenWithProps<{
    columns: TooltipTableColumn<D, SI>[];
    items: TooltipValue<D, SI>[];
    pinned?: boolean;
    onSelect?: ToggleSelectedTooltipItemCallback;
    selected?: TooltipValue<D, SI>[];
}, {
    /**
     * Used to define the column widths, otherwise auto-generated
     */
    gridTemplateColumns: CSSProperties['gridTemplateColumns'];
}, {
    className?: string;
    maxHeight?: CSSProperties['maxHeight'];
}>;
/** @public */
export declare const TooltipTable: <D extends BaseDatum = any, SI extends SeriesIdentifier = SeriesIdentifier>({ className, ...props }: TooltipTableProps<D, SI>) => JSX.Element;
export {};
//# sourceMappingURL=tooltip_table.d.ts.map